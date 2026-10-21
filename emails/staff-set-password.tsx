import { EmailLayout } from "./components/email-layout";
import { Cta, P, Title } from "./components/ui";

export type StaffSetPasswordProps = { actionLink: string };

export default function StaffSetPassword({ actionLink }: StaffSetPasswordProps) {
  return (
    <EmailLayout locale="en" preview="Set your password for the operations board">
      <Title>Set your password</Title>
      <P>Use the button below to set your password for the Media Print Pack operations board.</P>
      <Cta href={actionLink}>Set your password</Cta>
      <P muted>This link works once and expires shortly — if you didn&apos;t request it, you can ignore this email.</P>
    </EmailLayout>
  );
}

StaffSetPassword.PreviewProps = {
  actionLink: "https://mediaprint-eg.com/ops/set-password?token=example",
} satisfies StaffSetPasswordProps;
