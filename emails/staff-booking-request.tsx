import { EmailLayout } from "./components/email-layout";
import { Details, MailLink, Quote, Title } from "./components/ui";

export type StaffBookingRequestProps = {
  where: string;
  name: string;
  company: string | null;
  phone: string;
  email: string;
  date: string;
  time: string;
  topic: string | null;
  notes: string | null;
};

export default function StaffBookingRequest(fields: StaffBookingRequestProps) {
  return (
    <EmailLayout locale="en" preview={`${fields.name} — ${fields.date} at ${fields.time}`}>
      <Title>New meeting booking</Title>
      <Details
        rows={[
          { label: "Meeting", value: fields.where },
          { label: "Date", value: fields.date, ltr: true },
          { label: "Time", value: fields.time, ltr: true },
          ...(fields.topic ? [{ label: "Topic", value: fields.topic }] : []),
        ]}
      />
      <Details
        rows={[
          { label: "Name", value: fields.name },
          ...(fields.company ? [{ label: "Company", value: fields.company }] : []),
          { label: "Phone", value: fields.phone, ltr: true },
          { label: "Email", value: <MailLink email={fields.email} /> },
        ]}
      />
      {fields.notes && <Quote label="Notes">{fields.notes}</Quote>}
    </EmailLayout>
  );
}

StaffBookingRequest.PreviewProps = {
  where: "Online meeting (video / WhatsApp call)",
  name: "Ahmed Mahmoud",
  company: "Nuit Perfumes",
  phone: "01005750973",
  email: "ahmed@example.com",
  date: "2026-10-24",
  time: "12:00",
  topic: "A new packaging order",
  notes: "Please bring mailer box samples.",
} satisfies StaffBookingRequestProps;
