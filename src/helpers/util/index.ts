import { ObjectSchema } from "yup";

export async function validateDTO(DTOSchema: ObjectSchema<any, any>, params: any) {
    return await DTOSchema.validate(params)
}