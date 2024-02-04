import { initializeDatabase, insertUserData, selectUserDataByUsername, selectUserData, truncateTable } from "/assets/db/tasks.js";
import { getEncryptedData } from "/modules/general/encryption.js";

export const localStorageKeys = {
    CURRENT_USERNAME: "CURRENT_USERNAME",
};

export const checkAccount = () => {
    const currentUsername = localStorage.getItem(
        localStorageKeys.CURRENT_USERNAME
    );

    if (currentUsername == "" || currentUsername == null) {
        return false;
    } else {
        return true;
    }
};

export const createAccount = async ({ username, encryptionKey, password }) => {
    const encryptedData = await getEncryptedData({ encryptionKey, password });

    try {
        const db = await initializeDatabase();

        const result = await insertUserData(
            db,
            username,
            encryptedData.encrypted_key,
            encryptedData.password
        );

        console.log(result);
    } catch (error) {
        console.error(error);
    }
};

export const getUserByUsername = async (username) => {
    try {
        const db = await initializeDatabase();

        const result = await selectUserDataByUsername(
            db,
            username
        );

        return result;
    } catch (error) {
        console.error(error);
    }
};

export const getAllUsers = async () => {
    try {
        const db = await initializeDatabase();

        const result = await selectUserData(
            db
        );

        console.log(result);
    } catch (error) {
        console.error(error);
    }
};

export const deleteAllUsers = async () => {
    try {
        const db = await initializeDatabase();

        const result = await truncateTable(
            db,
            'user'
        );

        console.log(result);
    } catch (error) {
        console.error(error);
    }
};

