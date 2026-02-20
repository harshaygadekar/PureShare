import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface DownloadNotificationEmailProps {
  recipientName?: string;
  shareLink: string;
  filename: string;
  downloadTime: string;
  totalDownloads: number;
}

export const DownloadNotificationEmail = ({
  recipientName = "User",
  shareLink,
  filename,
  downloadTime,
  totalDownloads,
}: DownloadNotificationEmailProps) => {
  const shareUrl = `https://pureshare.app/share/${shareLink}`;

  return (
    <Html>
      <Head />
      <Preview>File downloaded from your PureShare</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={greeting}>Hi {recipientName},</Text>
            
            <Text style={text}>
              Someone just downloaded a file from your PureShare!
            </Text>

            <Section style={detailsBox}>
              <Text style={detailLabel}>File Downloaded</Text>
              <Text style={detailValue}>{filename}</Text>
              
              <Hr style={hr} />
              
              <Text style={detailLabel}>Download Time</Text>
              <Text style={detailValue}>{downloadTime}</Text>
              
              <Hr style={hr} />
              
              <Text style={detailLabel}>Total Downloads</Text>
              <Text style={detailValue}>{totalDownloads} downloads</Text>
            </Section>

            <Button href={shareUrl} style={button}>
              View Share
            </Button>

            <Text style={footer}>
              You can manage your notification preferences in your PureShare dashboard settings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 0",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const section = {
  padding: "0 40px",
};

const greeting = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "20px",
};

const text = {
  fontSize: "16px",
  color: "#4a4a4a",
  lineHeight: "24px",
  marginBottom: "24px",
};

const detailsBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};

const detailLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "4px",
};

const detailValue: React.CSSProperties = {
  fontSize: "16px",
  color: "#1a1a1a",
  fontWeight: "500",
  marginBottom: "12px",
};

const hr = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "12px 0",
};

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  marginBottom: "24px",
};

const footer = {
  fontSize: "14px",
  color: "#9ca3af",
  lineHeight: "20px",
  textAlign: "center" as const,
};
