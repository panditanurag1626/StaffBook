import React, { useState } from "react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";
import { FiLoader, FiAlertCircle } from "react-icons/fi";

interface WithdrawApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    jobId: string;
    onSubmit: (formData: FormData) => Promise<void>;
}

const WithdrawApplicationModal: React.FC<WithdrawApplicationModalProps> = ({
    isOpen,
    onClose,
    jobTitle,
    jobId,
    onSubmit,
}) => {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("job_post_id", jobId);
            formData.append("reason", reason);
            await onSubmit(formData);
        } catch (error) {
            console.error("Failed to withdraw application", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="w-full max-w-md p-6 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4 text-red-600 border-b border-red-50 pb-3">
                    <FiAlertCircle size={24} />
                    <h2 className="text-xl font-bold">Withdraw Application</h2>
                </div>

                <p className="text-gray-600 mb-6 text-sm">
                    Are you sure you want to withdraw your application for <span className="font-bold text-gray-900">{jobTitle}</span>? This action cannot be undone.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Withdrawal (Required)</label>
                        <textarea
                            required
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none min-h-[100px] text-sm"
                            placeholder="e.g., Accepted another offer, No longer interested, Found a better opportunity..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={{ color: "black" }}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 py-2.5 rounded-xl font-bold"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                            disabled={submitting || !reason.trim()}
                        >
                            {submitting ? (
                                <>
                                    <FiLoader className="animate-spin" />
                                    Withdrawing...
                                </>
                            ) : (
                                "Confirm Withdrawal"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default WithdrawApplicationModal;
