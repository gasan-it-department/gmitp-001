
export interface Department {
    id: string;
    name: string;
}

export interface FeedbackFormData {
    feedback_target: 'employee' | 'department';
    department_id?: string;
    employee_name: string;
    feedback_message: string;
    sender_name?: string;
    rating?: number;
    message: string;
    id: string;
    created_at: string;
}

export interface BaseFeedbackForm {
    subjectType: "department" | "employee";
    senderName: string;
    message: string;
    evidenceFile?: File[];
    isAnonymous: boolean;
}

export interface DepartmentFeedbackForm extends BaseFeedbackForm {
    subjectType: "department";
    departmentId: string;
    rating?: number;
    employeeName?: never;

}

export interface EmployeeFeedbackForm extends BaseFeedbackForm {
    subjectType: "employee";
    employeeName: string;
    departmentId?: never;
    rating?: never;
}

export type FeedbackForm = DepartmentFeedbackForm | EmployeeFeedbackForm;



