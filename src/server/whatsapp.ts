/**
 * WhatsApp Integration Service
 * 
 * This service handles sending WhatsApp messages to users.
 * Currently, it simulates sending messages. To enable real WhatsApp integration,
 * configure a provider like Twilio or Meta Official API below.
 */

export async function sendWhatsAppMessage(to: string, message: string) {
  // 1. Check if we have a valid number
  if (!to || to.trim() === "") {
    console.log("[WhatsApp] No destination number provided. Skipping.");
    return { success: false, error: "No destination number" };
  }

  // 2. Format the number (e.g. ensure it starts with country code if using Twilio)
  const formattedNumber = to.startsWith("+") ? to : `+91${to.replace(/\D/g, '')}`;

  console.log(`\n========================================`);
  console.log(`💬 [WHATSAPP MESSAGE DISPATCHED]`);
  console.log(`To: ${formattedNumber}`);
  console.log(`Message: \n${message}`);
  console.log(`========================================\n`);

  // TODO: Implement actual API call here
  // Example Twilio Implementation:
  /*
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  try {
    const response = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Your Twilio WhatsApp Sandbox/Approved number
      to: `whatsapp:${formattedNumber}`
    });
    return { success: true, messageId: response.sid };
  } catch (err) {
    console.error("[WhatsApp] Failed to send message:", err);
    return { success: false, error: err.message };
  }
  */

  // Simulate network delay for realism
  await new Promise(r => setTimeout(r, 800));

  return { success: true, simulated: true };
}

/**
 * Helper to notify project managers about new critical issues
 */
export async function notifyManagerOnCriticalIssue(managerWhatsApp: string, issueTitle: string, projectName: string) {
  const message = `🚨 *CRITICAL ALERT* 🚨\n\nA new critical issue has been reported on your project: *${projectName}*\n\n*Issue:* ${issueTitle}\n\nPlease check the Naushik Dashboard immediately.`;
  return await sendWhatsAppMessage(managerWhatsApp, message);
}
