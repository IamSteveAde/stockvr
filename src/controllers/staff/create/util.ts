import { object, string } from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { nanoid } from "nanoid";
import { ACCESS_TYPES } from "../../../helpers/accessTypes";
import { sendMail } from "../../../helpers/util";
import { hashPassword } from "../../auth/create-account/util";
import { SECRETS } from "../../../helpers/util/secrets";

export const CreateStaffDTO = object({
    name: string().required("Full name is required."),
    email: string().email("Invalid email address.").required("Email address is required."),
    phoneNo: string().required("Phone number is required."),
    role: string().oneOf([ACCESS_TYPES.staff.toLowerCase(), ACCESS_TYPES.manager.toLowerCase()], "Invalid role").required("Role is required."),
    businessUid: string().required("Business profile UID is required.")
});

export type TCreateStaffDTO = typeof CreateStaffDTO.__outputType;


export async function getBusinessProfile(businessId: string){
    return await prisma.businessProfile.findFirst(
        {
            where: {
                uid: businessId
            }
        }
    )
}

function generatePin(length = 6): string {
    let pin = "";
    for (let i = 0; i < length; i++) {
        pin += Math.floor(Math.random() * 10).toString();
    }
    return pin
}

export async function createStaff(data: TCreateStaffDTO) {
    // Check if user already exists
    const existingUser = await prisma.users.findFirst({ where: { email: data.email } });
    if (existingUser) throw new InternalError(null, "A user with this email already exists.");

    // Generate PIN and set as password
    const pin = generatePin();

    // Create user and user profile
    const user = await prisma.users.create({
        data: {
            uid: `STAFF-${nanoid(24)}`,
            email: data.email,
            password: await hashPassword({ password: pin }), // In production, hash this PIN
            isFirstLogin: false,
            verified: true,

            userProfiles: {
                create: {
                    uid: `PROFILE-${nanoid(12)}`,
                    businessUid: data.businessUid,
                    accessType: data.role,
                    phoneNo: data.phoneNo,
                    name: data.name,
                    status: "Active",
                    pin: pin,

                }
            }
        },
        include: { userProfiles: true }
    });

    return { user, pin };
}




export const staffInviteHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>You've been added to StockVAR</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f3;font-family:'DM Sans',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4f3;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid #d1e0dd;overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#19464b,#14b8a6,#5eead4);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:20px 32px;background-color:#19464b;">
              <img src="${SECRETS.BANNER_IMAGE}" alt="StockVAR" width="180" style="display:block;border:0;outline:none;text-decoration:none;max-width:180px;"/>
            </td>
          </tr>
          <!-- Header text row -->
          <tr>
            <td style="padding:36px 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    </td>
                </tr>
                <tr>
                  <td style="padding-top:20px;">
                    <h1 style="margin:0;font-size:24px;font-weight:600;color:#111827;line-height:1.3;letter-spacing:-0.02em;">
                      Welcome aboard, %s.
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
                      You've been added to <span style="color:#111827;font-weight:500;">%s</span> on StockVAR to help manage and track stock operations. Your account is ready to go.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Credentials block -->
          <tr>
            <td style="padding:0 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4f3;border-radius:8px;border:1px solid #d1e0dd;overflow:hidden;">

                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #d1e0dd;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;padding-bottom:4px;">Login Email</td>
                      </tr>
                      <tr>
                        <td style="font-family:'DM Mono',monospace;font-size:14px;color:#111827;">%s</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;padding-bottom:4px;"> Password</td>
                      </tr>
                      <tr>
                        <td style="font-family:'DM Mono',monospace;font-size:14px;color:#19464b;letter-spacing:0.05em;">%s</td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 36px 40px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#19464b;border-radius:8px;">
                    <a href="%s" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      Login to your account &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #e5eeec;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Responsibilities -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 18px 0;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;">
                What you'll be doing on StockVAR
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f4f3;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:1px;">
                          <span style="display:inline-block;width:18px;height:18px;background-color:#ccfbf1;border-radius:4px;text-align:center;line-height:18px;font-size:11px;">📦</span>
                        </td>
                        <td style="font-size:14px;color:#374151;line-height:1.5;">Recording stock usage during your shift</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f4f3;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:1px;">
                          <span style="display:inline-block;width:18px;height:18px;background-color:#ccfbf1;border-radius:4px;text-align:center;line-height:18px;font-size:11px;">🔄</span>
                        </td>
                        <td style="font-size:14px;color:#374151;line-height:1.5;">Updating stock levels accurately</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:10px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:1px;">
                          <span style="display:inline-block;width:18px;height:18px;background-color:#ccfbf1;border-radius:4px;text-align:center;line-height:18px;font-size:11px;">✅</span>
                        </td>
                        <td style="font-size:14px;color:#374151;line-height:1.5;">Helping maintain clear and accountable kitchen operations</td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Tagline block -->
          <tr>
            <td style="padding:0 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#f0fdf9;border-left:3px solid #19464b;border-radius:0 6px 6px 0;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                      StockVAR is designed to be simple and fast — so you can focus on your work while keeping stock properly tracked.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #e5eeec;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                If you have trouble accessing your account, please contact your manager or reach out to support at
                <a href="mailto:%s" style="color:#19464b;text-decoration:none;">%s</a>.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #e5eeec;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Sign off -->
          <tr>
            <td style="padding:24px 40px 32px 40px;">
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                Welcome to the team,<br/>
                <span style="color:#111827;font-weight:600;">The StockVAR Team</span>
              </p>
            </td>
          </tr>

          <!-- Bottom tagline -->
          <tr>
            <td style="background-color:#f0f4f3;padding:16px 40px;border-top:1px solid #d1e0dd;">
              <p style="margin:0;font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;text-align:center;">
                Clarity in every shift.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`
