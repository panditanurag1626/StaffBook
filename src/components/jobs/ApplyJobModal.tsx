import React, { useState, useRef } from "react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";
import { THEME } from "@/styles/theme";
import { FiUpload, FiCheckCircle, FiLoader, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface ApplyJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    jobTitle: string;
    screeningQuestions?: string[] | string;
    onSubmit: (formData: FormData) => Promise<void>;
}

const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
    isOpen,
    onClose,
    jobId,
    jobTitle,
    screeningQuestions = [],
    onSubmit,
}) => {
    const router = useRouter();
    const [described, setDescribed] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const getQuestionsArray = (questions?: string[] | string) => {
        if (!questions) return [];
        if (Array.isArray(questions)) return questions;
        try {
            return JSON.parse(questions);
        } catch (e) {
            return [];
        }
    };

    const questionsArray = getQuestionsArray(screeningQuestions);

    const [answers, setAnswers] = useState<string[]>(
        new Array(questionsArray.length).fill("")
    );
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const topRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleClose = () => {
        if (isSuccess) {
            router.push('/profile/jobs?tab=applied-jobs');
        }
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError("");
        try {
            const formData = new FormData();
            formData.append("job_post_id", jobId);
            formData.append("described", described);
            if (file) {
                formData.append("resume_file", file);
            }

            // Formatting answers as JSON string in the required format
            const formattedAnswers = questionsArray.map((question: string, index: number) => ({
                question: question,
                answer: answers[index] || ""
            }));
            formData.append("screening_questions_answers", JSON.stringify(formattedAnswers));

            await onSubmit(formData);
            setIsSuccess(true);
        } catch (error: any) {
            console.error("Application failed", error);

            // Handle complex error response structure
            let errorMessage = "Failed to submit application";
            const responseData = error?.response?.data || error?.data || error;

            // Check for nested errors in data.errors or top-level errors
            const errorsObj = responseData?.data?.errors || responseData?.errors;

            if (errorsObj && typeof errorsObj === 'object') {
                const messages = Object.values(errorsObj).flat().filter(m => typeof m === 'string');
                if (messages.length > 0) {
                    errorMessage = messages.join(". ");
                }
            } else if (responseData?.message) {
                errorMessage = responseData.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            setSubmitError(errorMessage);

            // Scroll to top of the modal content
            setTimeout(() => {
                topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <div className="w-full max-w-2xl p-8 overflow-y-auto">
                <div ref={topRef} />
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
                            <FiCheckCircle className="text-green-500 w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted Successfully</h2>
                        <p className="text-gray-500 mb-10 max-w-md mx-auto">
                            Your application has been successfully submitted for the <span className="font-bold text-gray-800">{jobTitle}</span> position.
                        </p>
                        <Button
                            onClick={handleClose}
                            className="bg-purple-600 text-white px-12 py-4 rounded-xl font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                            Go to Applied Jobs
                        </Button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for {jobTitle}</h2>
                        <p className="text-gray-500 mb-6 italic text-sm">Please complete the details below to submit your application.</p>

                        {submitError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium text-sm text-center">
                                {submitError}
                            </div>
                        )}

                        {submitError.toLowerCase().includes('already applied') ? (
                            <div className="pt-2 flex justify-center">
                                <Button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-10 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition-all"
                                >
                                    Close
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Resume Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Resume / CV</label>
                                    <div className="relative group">
                                        {!file && (
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx"
                                            />
                                        )}
                                        <div className={`p-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-3 transition-all ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 group-hover:border-purple-500 group-hover:bg-purple-50'}`}>
                                            {file ? (
                                                <>
                                                    <div className="flex items-center justify-between w-full px-2">
                                                        <div className="flex items-center gap-3">
                                                            <FiCheckCircle className="text-green-500" size={20} />
                                                            <span className="text-green-700 font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFile(null);
                                                            }}
                                                            className="p-1 hover:bg-green-100 rounded-full text-green-700 transition-colors z-20"
                                                            title="Remove resume"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <FiUpload className="text-gray-400 group-hover:text-purple-500" size={20} />
                                                    <span className="text-gray-500 group-hover:text-purple-700 font-medium">Click to upload your resume</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[10px] text-gray-400">Accepted formats: PDF, DOC, DOCX (Max 2MB)</p>
                                </div>

                                {/* Screening Questions */}
                                {questionsArray.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <h3 className="font-bold text-gray-900">Screening Questions</h3>
                                        {questionsArray.map((question: string, index: number) => (
                                            <div key={index}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2 italic">
                                                    <span className="font-bold text-purple-600 not-italic mr-1">Q{index + 1}:</span> {question}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm"
                                                    placeholder="Your answer..."
                                                    value={answers[index]}
                                                    style={{ color: "black" }}
                                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-6 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 py-3 rounded-xl font-bold"
                                        onClick={handleClose}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <FiLoader className="animate-spin" />
                                                Applying...
                                            </>
                                        ) : (
                                            "Submit Application"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ApplyJobModal;
