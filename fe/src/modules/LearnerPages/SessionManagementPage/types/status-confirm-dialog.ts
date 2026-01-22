export type StatusConfirmDialogState = {
    id: string;
    open: boolean;
    desciption: string;
    action: StatusConfirmDialogAction;
};

export enum StatusConfirmDialogAction {
    NONE,
    APPROVE = "Approve",
    REJECT = "Reject",
    RESCHEDULE = "Reschedule",
}

export const statusConfirmDialogStateDefault: StatusConfirmDialogState = {
    id: "",
    open: false,
    desciption: "",
    action: StatusConfirmDialogAction.NONE,
};
