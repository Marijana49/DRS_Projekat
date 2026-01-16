export interface EmailDTO {
    id: number;
    to: string;
    subject: string;
    body: string;
    sent_at: Date;
}

