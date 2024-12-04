import authRoutes from './auth/routes';
import userRoutes from './users/routes';
import adminWebRoutes from './adminWeb/routes';

export default [
    ...authRoutes,
    ...userRoutes,
    ...adminWebRoutes,
];
