import { Response, Request, NextFunction } from "express"
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { getSubscriptionForBusiness } from "../find-subscription/util";
import { getBusinessIdFromRequest, getProfileUidFromRequest } from "../../../helpers/util";
import { generateInvoicePdf, InvoiceData } from "./util";
import { formatDate, getMonth, getYear } from "date-fns"
import { fetchOtherUserProfile } from "../../profile/get-profile/util";



export async function DownloadInvoiceController(req: Request, res: Response, next: NextFunction) {
    try {

        const businessProfileUid = getBusinessIdFromRequest(req)
        const profileUid = getProfileUidFromRequest(req)

        const subData = await getSubscriptionForBusiness(businessProfileUid.busId)

        const profile = await fetchOtherUserProfile(profileUid)

        const data: InvoiceData = {
            invoiceId: subData?.subscriptionRef!,
            dateIssued: subData?.createdAt!.toUTCString()!,
            paymentStatus: subData?.transactions[0]?.status! || "Trial",
            billingPeriodStart: subData?.startAt!.toUTCString()!,
            billingPeriodEnd: subData?.endAt!.toUTCString()!,
            nextBillingDate: formatDate(subData?.endAt!, "MM/dd/yyyy"),
            restaurantName: profile.businessProfile?.name!,
            contactPerson: profile.name!,
            email: profile.owner.email,
            description: `StockVAR ${subData?.isTrial ? "Trial" : "Monthly"} Subscription (${getMonth(subData?.createdAt!)|| ""}, ${getYear(subData?.createdAt!) || ""})`,
            amount: `${subData?.transactions[0]?.currency! || ""} ${subData?.transactions[0]?.amount! || "NGN 0.0"}`,
            paymentDate: subData?.transactions[0]?.createdAt!.toDateString()! || "",
            paymentMethod: subData?.transactions[0]?.source! || "",
            reference: subData?.transactions[0]?.trxRef! ? "STV/TRF/" + subData?.transactions[0]?.trxRef! :  "",
            amountPaid: `${subData?.transactions[0]?.currency! || ""} ${subData?.transactions[0]?.amount! || "NGN 0.0"}`,
            year: `${getYear(subData?.createdAt!)}`,
        };

        const pdfBuffer = await generateInvoicePdf(data);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="StockVAR-invoice-${data.invoiceId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);
    } catch (err) {
        // console.error('Invoice generation failed:', err);
        // res.status(500).json({ message: 'Failed to generate invoice' });

        next(new InternalError(err))
    }
}