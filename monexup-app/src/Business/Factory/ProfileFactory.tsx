import ServiceFactory from '../../Services/ServiceFactory';
import ProfileBusiness from '../Impl/ProfileBusiness';
import IProfileBusiness from '../Interfaces/IProfileBusiness';

const profileService = ServiceFactory.ProfileService;

const profileBusinessImpl: IProfileBusiness = ProfileBusiness;
profileBusinessImpl.init(profileService);

const ProfileFactory = {
  ProfileBusiness: profileBusinessImpl
};

export default ProfileFactory;
