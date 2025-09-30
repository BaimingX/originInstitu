import React, { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CheckCircle, Copy } from 'lucide-react';
import { AGENT_FORM_FIELDS } from '../../utils/validation';
import FormField from './FormField';
import SimpleFileUpload from './SimpleFileUpload';
import SubmitButton from './SubmitButton';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { generateAgentApplicationId } from '../../utils/fileHelpers';
import toast from 'react-hot-toast';

const AgentApplicationForm = ({ onBackToHome }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  const { isSubmitting, submitStatus, submitForm, clearStatus, isPowerAutomateMode } = useFormSubmit();
  const [files, setFiles] = React.useState([]);
  const [agentApplicationId, setAgentApplicationId] = React.useState('');
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = React.useState('');

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    
    // 重置表单并生成新的ID
    reset();
    setFiles([]);
    const newId = generateAgentApplicationId();
    setAgentApplicationId(newId);
    setValue('agentApplicationId', newId);
    setSubmittedApplicationId('');
  }, [reset, setValue]);

  // 确保页面加载时滚动到顶部并生成Agent Application ID
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // 生成唯一的Agent Application ID
    const newId = generateAgentApplicationId();
    setAgentApplicationId(newId);
    setValue('agentApplicationId', newId);
  }, [setValue]);

  // 处理ESC键关闭弹窗
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showSuccessModal) {
        handleSuccessModalClose();
      }
    };

    if (showSuccessModal) {
      document.addEventListener('keydown', handleEscapeKey);
      // 阻止页面滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showSuccessModal, handleSuccessModalClose]);

  const onSubmit = async (data) => {
    try {
      // Add form type and ensure agentApplicationId is included
      const formData = {
        ...data,
        formType: 'agent-application',
        agentApplicationId: agentApplicationId || generateAgentApplicationId()
      };
      
      await submitForm(formData, files);
      
      // 保存提交的Application ID并显示成功弹窗
      setSubmittedApplicationId(formData.agentApplicationId);
      setShowSuccessModal(true);
      
      // 不再显示toast，因为用弹窗替代
      clearStatus();
    } catch (error) {
      toast.error('Submission failed, please try again');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(submittedApplicationId).then(() => {
      toast.success('Application ID copied to clipboard!');
    }).catch(() => {
      // 如果clipboard API不可用，使用fallback方法
      const textArea = document.createElement('textarea');
      textArea.value = submittedApplicationId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Application ID copied to clipboard!');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* 返回按钮 - 固定在左上角 */}
      {onBackToHome && (
        <div className="absolute top-8 left-8 z-10">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors text-lg bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={24} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            New Agent Application Form
          </h1>
          {/* 显示生成的Agent Application ID */}
          {agentApplicationId && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-sm text-blue-700">
                <strong>Application ID:</strong> <span className="font-mono">{agentApplicationId}</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Please save this number for future reference
              </p>
            </div>
          )}
        </div>
        
        {/* 状态显示区域 */}
        <div className="mb-6">
          {isPowerAutomateMode ? (
            <div className="p-3 bg-green-100 border border-green-300 rounded text-sm text-green-700">
              ✅ Connected to Power Automate - Form submission will be saved to SharePoint list via Power Automate flow
            </div>
          ) : (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-700">
              ⚠️ Use mock API - Please configure Power Automate flow environment variables for real submission
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 隐藏的Agent Application ID字段 */}
          <input
            type="hidden"
            {...register('agentApplicationId')}
            value={agentApplicationId}
          />

          {/* 机构基本信息 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Agency Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  field={AGENT_FORM_FIELDS.agencyName}
                  register={register}
                  error={errors.agencyName}
                />
              </div>
              <FormField
                field={AGENT_FORM_FIELDS.contactPerson}
                register={register}
                error={errors.contactPerson}
              />
              <FormField
                field={AGENT_FORM_FIELDS.tel}
                register={register}
                error={errors.tel}
              />
            </div>
          </div>

          {/* 联系信息 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                field={AGENT_FORM_FIELDS.primaryEmail}
                register={register}
                error={errors.primaryEmail}
              />
              <FormField
                field={AGENT_FORM_FIELDS.alternateEmail}
                register={register}
                error={errors.alternateEmail}
              />
            </div>
          </div>

          {/* 地址信息 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                field={AGENT_FORM_FIELDS.address}
                register={register}
                error={errors.address}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  field={AGENT_FORM_FIELDS.cityTownSuburb}
                  register={register}
                  error={errors.cityTownSuburb}
                />
                <FormField
                  field={AGENT_FORM_FIELDS.stateProvince}
                  register={register}
                  error={errors.stateProvince}
                />
                <FormField
                  field={AGENT_FORM_FIELDS.postcode}
                  register={register}
                  error={errors.postcode}
                />
              </div>
              <FormField
                field={AGENT_FORM_FIELDS.country}
                register={register}
                error={errors.country}
              />
            </div>
          </div>

          {/* 业务信息 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                field={AGENT_FORM_FIELDS.acn}
                register={register}
                error={errors.acn}
              />
              <FormField
                field={AGENT_FORM_FIELDS.abn}
                register={register}
                error={errors.abn}
              />
            </div>
            <div className="mt-6">
              <FormField
                field={AGENT_FORM_FIELDS.targetRecruitmentCountry}
                register={register}
                error={errors.targetRecruitmentCountry}
              />
            </div>
          </div>

          {/* 文件上传 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Agent Introduction</h2>
            <SimpleFileUpload
              files={files}
              setFiles={setFiles}
              acceptedFileTypes={{
                'application/pdf': ['.pdf']
              }}
              maxFileSize={10 * 1024 * 1024} // 10MB
              maxFiles={1}
              label="Upload Agent Introduction Document (PDF only)"
              description="Please upload your agency introduction document in PDF format"
              required={true}
            />
            <p className="text-sm text-gray-600 mt-3">
              📋 Required: Please upload one PDF document introducing your agency and services.
            </p>
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Currently only PDF files are supported. Maximum file size: 10MB.
              </p>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-center pt-6">
            <SubmitButton 
              isSubmitting={isSubmitting}
              submitStatus={submitStatus}
              text="Submit Agent Application"
              submittingText="Submitting Application..."
            />
          </div>
        </form>
      </div>

      {/* 成功提交弹窗 */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // 只有点击背景时才关闭弹窗
            if (e.target === e.currentTarget) {
              handleSuccessModalClose();
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all">
            {/* 成功图标 */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            {/* 标题 */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
              Application submitted successfully!
            </h2>
            
            {/* 成功消息 */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Your agent application has been successfully submitted to the system. Please save the following application number for future reference:
              </p>
              
              {/* Application ID 显示区域 */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700 font-medium mb-2">Application ID</p>
                <div className="flex items-center justify-between bg-white rounded px-3 py-2 border">
                  <span className="font-mono text-lg text-gray-800 font-semibold">
                    {submittedApplicationId}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="ml-2 p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                💡 Please save this number in a secure location, you may need it to check the application status or contact us.
              </p>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Copy size={18} className="mr-2" />
                Copy Application ID
              </button>
              
              <button
                onClick={handleSuccessModalClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Confirm, continue
              </button>
            </div>
            
            {/* 额外提示 */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Next:</strong> We will review your application within 5-10 business days. If you have any questions, please contact us and provide your application number.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentApplicationForm; 