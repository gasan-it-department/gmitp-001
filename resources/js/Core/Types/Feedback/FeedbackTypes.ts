
export interface Department {
    id: string;
    name: string;
}

export interface Feedback {
    id: string;
    userId?: string;
    message: string;
    subject: string;
    rating?: number;
    createdAt: string;

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



