import BusinessResult from "../../DTO/Business/BusinessResult";
import ProductLinkInfo from "../../DTO/Domain/ProductLinkInfo";
import IProductLinkService from "../../Services/Interfaces/IProductLinkService";

export default interface IProductLinkBusiness {
  init: (service: IProductLinkService) => void;
  upsert: (lofnProductId: number, networkId: number, userId: number) => Promise<BusinessResult<ProductLinkInfo>>;
  listByNetwork: (networkId: number) => Promise<BusinessResult<ProductLinkInfo[]>>;
  listByUser: (userId: number) => Promise<BusinessResult<ProductLinkInfo[]>>;
  deleteByNetwork: (networkId: number) => Promise<BusinessResult<unknown>>;
}
