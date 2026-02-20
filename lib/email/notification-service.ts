import { Resend } from "resend";
import { DownloadNotificationEmail } from "./download-notification";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendDownloadNotificationParams {
  to: string;
  recipientName?: string;
  shareLink: string;
  filename: string;
  downloadTime: string;
  totalDownloads: number;
}

export async function sendDownloadNotification({
  to,
  recipientName,
  shareLink,
  filename,
  downloadTime,
  totalDownloads,
}: SendDownloadNotificationParams): Promise<boolean> {
  if (!resend) {
    console.log("[Download Notification] Resend not configured, skipping email");
    return false;
  }

  try {
    await resend.emails.send({
      from: "PureShare <noreply@pureshare.app>",
      to: [to],
      subject: `File downloaded: ${filename}`,
      react: DownloadNotificationEmail({
        recipientName,
        shareLink,
        filename,
        downloadTime,
        totalDownloads,
      }),
    });

    console.log(`[Download Notification] Email sent to ${to} for file ${filename}`);
    return true;
  } catch (error) {
    console.error("[Download Notification] Failed to send email:", error);
    return false;
  }
}
