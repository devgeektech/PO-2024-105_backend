import authRoutes from './auth/routes';
import userRoutes from './users/routes';
import wellnessTypeRotes from './adminWeb/wellnessTypes/routes';
import servicesRoutes from './adminWeb/services/routes'
import subServicesRoutes from './adminWeb/subServices/routes'
import partnerRoutes from './adminWeb/partners/routes'

export default [
    ...authRoutes,
    ...userRoutes,
    ...wellnessTypeRotes,
    ...servicesRoutes,
    ...subServicesRoutes,
    ...partnerRoutes
];
