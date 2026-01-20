/**
 * The authRoles object defines the authorization roles for the Fuse application.
 */
const authRoles = {
	/**
	 * The admin role grants access to users with the 'admin' role.
	 */
	admin: ['usuário'],

	/**
	 * The staff role grants access to users with the 'usuário' or 'staff' role.
	 */
	staff: ['usuário', 'staff'],

	/**
	 * The user role grants access to users with the 'usuário', 'staff', or 'user' role.
	 */
	user: ['usuário', 'staff', 'user'],

	/**
	 * The onlyGuest role grants access to unauthenticated users.
	 */
	onlyGuest: []
};

export default authRoles;
