const HERO01: string = "HERO01";
const HERO02: string = "HERO02";
const PROFILE01: string = "PROFILE01";
const PLAN_3_COLS: string = "PLAN_3_COLS";
const PRODUCT_LIST_WITH_3_COLS: string = "PRODUCT_LIST_WITH_3_COLS";
const TEAM_3_COLS: string = "TEAM_3_COLS";
const PRODUCT01: string = "PRODUCT01";

enum WebsitePartEnum {
    HERO01 = 1,
    HERO02 = 2,
    PROFILE01 = 3,
    PLAN_3_COLS = 4,
    PRODUCT_LIST_WITH_3_COLS = 5,
    TEAM_3_COLS = 6,
    PRODUCT01 = 7
}

const getTemplatePartTitle = (value: WebsitePartEnum) => {
    let title: string;
    switch (value) {
        case WebsitePartEnum.HERO01:
            title = "Hero 01";
            break;
        case WebsitePartEnum.HERO02:
            title = "Hero 02";
            break;
        case WebsitePartEnum.PROFILE01:
            title = "Profile 01";
            break;
        case WebsitePartEnum.PLAN_3_COLS:
            title = "Plans with 3 Columns";
            break;
        case WebsitePartEnum.PRODUCT_LIST_WITH_3_COLS:
            title = "Product list with 3 Columns";
            break;
        case WebsitePartEnum.TEAM_3_COLS:
            title = "Team list with 3 Columns";
            break;
        case WebsitePartEnum.PRODUCT01:
            title = "Product Detail 01";
            break;
    }
    return title;
};

const strToPartEnum = (value: string) => {
    let ret: WebsitePartEnum;
    switch (value) {
        case HERO01:
            ret = WebsitePartEnum.HERO01;
            break;
        case HERO02:
            ret = WebsitePartEnum.HERO02;
            break;
        case PROFILE01:
            ret = WebsitePartEnum.PROFILE01;
            break;
        case PLAN_3_COLS:
            ret = WebsitePartEnum.PLAN_3_COLS;
            break;
        case PRODUCT_LIST_WITH_3_COLS:
            ret = WebsitePartEnum.PRODUCT_LIST_WITH_3_COLS;
            break;
        case TEAM_3_COLS:
            ret = WebsitePartEnum.TEAM_3_COLS;
            break;
        case PRODUCT01:
            ret = WebsitePartEnum.PRODUCT01;
            break;
    }
    return ret;
};

const partEnumToStr = (value: WebsitePartEnum) => {
    let ret: string;
    switch (value) {
        case WebsitePartEnum.HERO01:
            ret = HERO01;
            break;
        case WebsitePartEnum.HERO02:
            ret = HERO02;
            break;
        case WebsitePartEnum.PROFILE01:
            ret = PROFILE01;
            break;
        case WebsitePartEnum.PLAN_3_COLS:
            ret = PLAN_3_COLS;
            break;
        case WebsitePartEnum.PRODUCT_LIST_WITH_3_COLS:
            ret = PRODUCT_LIST_WITH_3_COLS;
            break;
        case WebsitePartEnum.TEAM_3_COLS:
            ret = TEAM_3_COLS;
            break;
        case WebsitePartEnum.PRODUCT01:
            ret = PRODUCT01;
            break;
    }
    return ret;
};

export {  WebsitePartEnum, getTemplatePartTitle, strToPartEnum, partEnumToStr };