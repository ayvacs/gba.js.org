export function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const dbName = "gba_js_org_db";
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const userStore = db.createObjectStore("user", {
                keyPath: "id",
                autoIncrement: true,
            });
            userStore.createIndex("username", "username", { unique: true });
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

export function insertUserData(db, username, encryptionKey, password) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["user"], "readwrite");
        const userStore = transaction.objectStore("user");

        const newUser = {
            username: username,
            encryption_key: encryptionKey,
            password: password,
        };

        const request = userStore.add(newUser);

        request.onsuccess = async function () {
            // Resolve and commit the transaction
            transaction.commit();
            resolve(`User data inserted for ${username}`);

            // Close the database connection
            db.close();
        };

        request.onerror = function (event) {
            // Reject and roll back the transaction
            //transaction.rollback();
            reject(`Error inserting user data: ${event.target.error}`);
            db.close();
        };
    });
}

export function selectUserData(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["user"], "readonly");
        const userStore = transaction.objectStore("user");
        const request = userStore.openCursor();

        const userData = [];

        request.onsuccess = function (event) {
            const cursor = event.target.result;

            if (cursor) {
                userData.push(cursor.value);
                cursor.continue();
            } else {
                // No more data, resolve with the retrieved user data
                resolve(userData);
            }
        };

        request.onerror = function (event) {
            // Reject with the error if there is one
            reject(`Error fetching user data: ${event.target.error}`);
        };
    });
}

export function selectUserDataByUsername(db, username) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["user"], "readonly");
        const userStore = transaction.objectStore("user");
        const usernameIndex = userStore.index("username");
        
        const request = usernameIndex.get(username);

        request.onsuccess = function (event) {
            const userData = event.target.result;
            if (userData) {
                resolve(userData);
            } else {
                reject(`No user found with username: ${username}`);
            }
        };

        request.onerror = function (event) {
            reject(`Error fetching user data by username: ${event.target.error}`);
        };
    });
}

export function truncateTable(db, tableName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([tableName], "readwrite");
        const objectStore = transaction.objectStore(tableName);

        const clearRequest = objectStore.clear();

        clearRequest.onsuccess = function () {
            // Transaction will automatically commit
            resolve(`Table ${tableName} truncated successfully`);
            db.close();
        };

        clearRequest.onerror = function (event) {
            // Transaction will automatically roll back
            reject(
                `Error truncating table ${tableName}: ${event.target.error}`
            );
            db.close();
        };
    });
}
