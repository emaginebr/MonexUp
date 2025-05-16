import UserNetworkInfo from "../DTO/Domain/UserNetworkInfo";
import { LanguageEnum } from "../DTO/Enum/LanguageEnum";
import { UserRoleEnum } from "../DTO/Enum/UserRoleEnum";
import NavDropdown from 'react-bootstrap/NavDropdown';

const showFrequencyMin = (frequency: number) => {
    let ret: string;
    switch (frequency) {
        case 0:
            ret = "Unique";
            break;
        case 7:
            ret = "Week";
            break;
        case 30:
            ret = "Month";
            break;
        case 60:
            ret = "Bimonthly";
            break;
        case 90:
            ret = "Quarter";
            break;
        case 180:
            ret = "Half";
            break;
        case 365:
            ret = "Year";
            break;
    }
    return ret;
};

const showFrequencyMax = (frequency: number) => {
    let ret: string;
    switch (frequency) {
        case 0:
            ret = "Unique payment";
            break;
        case 7:
            ret = "Weekly payment";
            break;
        case 30:
            ret = "Monthly Payment";
            break;
        case 60:
            ret = "Bimonthly Payment";
            break;
        case 90:
            ret = "Quarterly Payment";
            break;
        case 180:
            ret = "Semiannual Payment";
            break;
        case 365:
            ret = "Annual Payment";
            break;
    }
    return ret;
};

const showProfile = (user: UserNetworkInfo) => {
    if (!user) {
        return "";
    }
    if (user.profile) {
        return user.profile?.name;
    }
    switch (user.role) {
        case UserRoleEnum.Administrator:
            return "Adminstrator";
            break;
        case UserRoleEnum.NetworkManager:
            return "Network Manager";
            break;
        case UserRoleEnum.Seller:
            return "Seller";
            break;
        case UserRoleEnum.User:
            return "User";
            break;
    }
};

function formatPhoneNumber(phone: string) {
    // Remove qualquer caractere que não seja número
    const digits = phone.replace(/\D/g, '');

    if (digits.length !== 11) return phone; // Retorna original se não tiver 11 dígitos

    const ddd = digits.slice(0, 2);
    const firstDigit = digits.slice(2, 3);
    const firstPart = digits.slice(3, 7);
    const secondPart = digits.slice(7);

    return (
        <><small>({ddd})</small> {firstDigit} {firstPart}-{secondPart}</>
    );
}

const MenuLanguage = () => {
    return (
        <NavDropdown title={
            <>
                <img src={process.env.PUBLIC_URL + "/flags/br.svg"} style={{ width: "21px", height: "21px" }} />
                &nbsp;Português
            </>
        } id="basic-nav-dropdown">
            <NavDropdown.Item>
                <img src={process.env.PUBLIC_URL + "/flags/gb.svg"} style={{ width: "21px", height: "21px" }} />
                &nbsp;Inglês
            </NavDropdown.Item>
            <NavDropdown.Item>
                <img src={process.env.PUBLIC_URL + "/flags/es.svg"} style={{ width: "21px", height: "21px" }} />
                &nbsp;Espanhol
            </NavDropdown.Item>
            <NavDropdown.Item>
                <img src={process.env.PUBLIC_URL + "/flags/fr.svg"} style={{ width: "21px", height: "21px" }} />
                &nbsp;Francês
            </NavDropdown.Item>
        </NavDropdown>
    );
};

const langToStr = (lang: LanguageEnum) => {
    let ret: string;
    switch (lang) {
        case LanguageEnum.English:
            ret = "en";
            break;
        case LanguageEnum.Spanish:
            ret = "es";
            break;
        case LanguageEnum.French:
            ret = "fr";
            break;
        case LanguageEnum.Portuguese:
            ret = "br";
            break;
        default:
            ret = "en";
            break;
    }
    return ret;
};

export { showFrequencyMin, showFrequencyMax, showProfile, formatPhoneNumber, MenuLanguage, langToStr };