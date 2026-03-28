import IHttpClient from "../../Infra/Interface/IHttpClient";
import IImageService from "../Interfaces/IImageService";

let _httpClient: IHttpClient;

const ImageService: IImageService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    uploadImageUser: async (file: Blob, token: string) => {
        const formData = new FormData();
        formData.append('file', file, 'cropped.jpg');
        return await _httpClient.doPostFormDataAuth<string>("/Image/uploadImageUser", formData, token);
    },
    uploadImageNetwork: async (networkId: number, file: Blob, token: string) => {
        const formData = new FormData();
        formData.append('file', file, 'cropped.jpg');
        formData.append('networkId', networkId.toString());
        return await _httpClient.doPostFormDataAuth<string>("/Image/uploadImageNetwork", formData, token);
    },
    uploadImageProduct: async (productId: number, file: Blob, token: string) => {
        const formData = new FormData();
        formData.append('file', file, 'cropped.jpg');
        formData.append('productId', productId.toString());
        return await _httpClient.doPostFormDataAuth<string>("/Image/uploadImageProduct", formData, token);
    },
}

export default ImageService;
