import { signIn, signOut, checkAuthStatus } from '../src/js/auth';

describe('Authentication Functions', () => {
    beforeEach(() => {
        // Mock Firebase authentication methods
        jest.clearAllMocks();
    });

    test('signIn should call Firebase signInWithEmailAndPassword', async () => {
        const email = 'test@example.com';
        const password = 'password123';
        const signInMock = jest.fn();
        const auth = { signInWithEmailAndPassword: signInMock };

        await signIn(email, password, auth);

        expect(signInMock).toHaveBeenCalledWith(email, password);
    });

    test('signOut should call Firebase signOut', async () => {
        const signOutMock = jest.fn();
        const auth = { signOut: signOutMock };

        await signOut(auth);

        expect(signOutMock).toHaveBeenCalled();
    });

    test('checkAuthStatus should return user if authenticated', async () => {
        const user = { uid: '123', email: 'test@example.com' };
        const onAuthStateChangedMock = jest.fn((callback) => callback(user));
        const auth = { onAuthStateChanged: onAuthStateChangedMock };

        const result = await checkAuthStatus(auth);

        expect(onAuthStateChangedMock).toHaveBeenCalled();
        expect(result).toEqual(user);
    });

    test('checkAuthStatus should return null if not authenticated', async () => {
        const onAuthStateChangedMock = jest.fn((callback) => callback(null));
        const auth = { onAuthStateChanged: onAuthStateChangedMock };

        const result = await checkAuthStatus(auth);

        expect(onAuthStateChangedMock).toHaveBeenCalled();
        expect(result).toBeNull();
    });
});