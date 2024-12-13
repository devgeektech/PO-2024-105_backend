import authRoutes from './auth/routes';
import userRoutes from './users/routes';
import wellnessTypeRotes from './adminWeb/wellnessTypes/routes';
import servicesRoutes from './adminWeb/services/routes'
import subServicesRoutes from './adminWeb/subServices/routes'
import adminpartnerProfileRoutes from './adminWeb/partners/routes'
import partnerProfileRoutes from './partner/profile/routes'
import companyRoutes from './adminWeb/company/routes'
import partnerClassRoutes  from './partner/classes/routes'

export default [
    ...authRoutes,
    ...userRoutes,
    ...wellnessTypeRotes,
    ...servicesRoutes,
    ...subServicesRoutes,
    ...adminpartnerProfileRoutes,
    ...partnerProfileRoutes,
    ...companyRoutes,
    ...partnerClassRoutes    
];
