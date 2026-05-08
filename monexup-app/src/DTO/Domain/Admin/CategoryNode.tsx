export default interface CategoryNode {
    categoryId: number;
    name: string;
    parentCategoryId: number | null;
    isHidden: boolean;
    children: CategoryNode[];
}
