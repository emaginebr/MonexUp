import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IImageService {
    init: (httpClient: IHttpClient) => void;
    uploadImageUser: (file: Blob, token: string) => Promise<ApiResponse<string>>;
    uploadImageNetwork: (networkId: number, file: Blob, token: string) => Promise<ApiResponse<string>>;
    uploadImageProduct: (productId: number, file: Blob, token: string) => Promise<ApiResponse<string>>;
}
