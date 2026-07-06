import HierarchyInfo from "../Domain/HierarchyInfo";
import ProviderResult from "./ProviderResult";

export default interface HierarchyProviderResult extends ProviderResult {
    hierarchy?: HierarchyInfo;
};
