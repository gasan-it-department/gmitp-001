import CreateUserController from './CreateUserController'
import AuthenticateUserController from './AuthenticateUserController'
const Auth = {
    CreateUserController: Object.assign(CreateUserController, CreateUserController),
AuthenticateUserController: Object.assign(AuthenticateUserController, AuthenticateUserController),
}

export default Auth