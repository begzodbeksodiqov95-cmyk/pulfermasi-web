// ==========================================
// PROFILE DATABASE
// ==========================================

(function () {

    // Telegram ID
    function getTelegramId() {

        if (
            window.Telegram &&
            Telegram.WebApp &&
            Telegram.WebApp.initDataUnsafe &&
            Telegram.WebApp.initDataUnsafe.user
        ) {
            return Telegram.WebApp.initDataUnsafe.user.id;
        }

        return localStorage.getItem("telegram_id");
    }


    // ==========================================
    // PROFILNI BAZADAN YUKLASH
    // ==========================================

    async function loadProfileFromDatabase() {

        const telegramId = getTelegramId();

        if (!telegramId) {
            console.log("Telegram ID topilmadi");
            return;
        }

        try {

            const response = await fetch(
                SUPABASE_URL +
                "/rest/v1/profiles?telegram_id=eq." +
                encodeURIComponent(telegramId) +
                "&select=*",
                {
                    method: "GET",
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization":
                            "Bearer " + SUPABASE_KEY
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Profilni yuklashda xato: " +
                    response.status
                );
            }

            const data = await response.json();

            if (!data.length) {
                console.log("Profil bazada topilmadi");
                return;
            }

            const profile = data[0];

            const name =
                document.getElementById(
                    "profileDisplayName"
                );

            const username =
                document.getElementById(
                    "profileDisplayUsername"
                );

            const bio =
                document.getElementById(
                    "profileDisplayBio"
                );

            const image =
                document.getElementById(
                    "profileImage"
                );


            if (name) {

                name.innerText =
                    profile.display_name || "Ism";

            }


            if (username) {

                username.innerText =
                    profile.username
                        ? "@" + profile.username.replace(/^@/, "")
                        : "@username";

            }


            if (bio) {

                bio.innerText =
                    profile.bio || "";

            }


            if (
                image &&
                profile.avatar_url
            ) {

                image.innerHTML = `

                    <img
                        src="${profile.avatar_url}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            border-radius:50%;
                        "
                    >

                `;

            }

            console.log(
                "Profil bazadan yuklandi ✅"
            );

        } catch (error) {

            console.error(
                "Profil yuklash xatosi:",
                error
            );

        }

    }


    // ==========================================
    // SAQLASH
    // ==========================================

    async function saveProfileToDatabase() {

        const telegramId =
            getTelegramId();

        if (!telegramId) {

            alert(
                "Telegram ID topilmadi ❌"
            );

            return;

        }


        const nameInput =
            document.getElementById(
                "editProfileName"
            );

        const usernameInput =
            document.getElementById(
                "editProfileUsername"
            );

        const bioInput =
            document.getElementById(
                "editProfileBio"
            );

        const imagePicker =
            document.getElementById(
                "editProfileImagePicker"
            );


        const displayName =
            nameInput.value.trim();

        let username =
            usernameInput.value.trim();

        const bio =
            bioInput.value.trim();


        if (!displayName) {

            alert("Ismni kiriting!");
            return;

        }


        username =
            username.replace(/^@/, "");


        try {

            // ==================================
            // ESKI PROFILNI TEKSHIRISH
            // ==================================

            const checkResponse =
                await fetch(
                    SUPABASE_URL +
                    "/rest/v1/profiles?telegram_id=eq." +
                    encodeURIComponent(telegramId) +
                    "&select=id,avatar_url",
                    {
                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY
                        }
                    }
                );


            if (!checkResponse.ok) {

                throw new Error(
                    "Profilni tekshirishda xato"
                );

            }


            const existing =
                await checkResponse.json();


            let avatarUrl =
                existing.length
                    ? existing[0].avatar_url
                    : null;


            // ==================================
            // RASM YUKLASH
            // ==================================

            if (
                imagePicker &&
                imagePicker.files &&
                imagePicker.files[0]
            ) {

                const file =
                    imagePicker.files[0];


                const fileName =
                    telegramId +
                    "_" +
                    Date.now() +
                    "_" +
                    file.name.replace(
                        /[^a-zA-Z0-9._-]/g,
                        "_"
                    );


                const uploadResponse =
                    await fetch(

                        SUPABASE_URL +
                        "/storage/v1/object/Profiles/" +
                        fileName,

                        {
                            method: "POST",

                            headers: {
                                "apikey":
                                    SUPABASE_KEY,

                                "Authorization":
                                    "Bearer " +
                                    SUPABASE_KEY,

                                "Content-Type":
                                    file.type
                            },

                            body: file
                        }

                    );


                if (!uploadResponse.ok) {

                    throw new Error(
                        "Profil rasmi yuklanmadi"
                    );

                }


                avatarUrl =
                    SUPABASE_URL +
                    "/storage/v1/object/public/Profiles/" +
                    fileName;

            }


            // ==================================
            // PROFIL MA'LUMOTI
            // ==================================

            const profileData = {

                telegram_id:
                    telegramId,

                display_name:
                    displayName,

                username:
                    username,

                bio:
                    bio,

                avatar_url:
                    avatarUrl

            };


            // ==================================
            // UPDATE YOKI INSERT
            // ==================================

            if (existing.length) {

                const updateResponse =
                    await fetch(

                        SUPABASE_URL +
                        "/rest/v1/profiles?telegram_id=eq." +
                        encodeURIComponent(telegramId),

                        {
                            method: "PATCH",

                            headers: {
                                "apikey":
                                    SUPABASE_KEY,

                                "Authorization":
                                    "Bearer " +
                                    SUPABASE_KEY,

                                "Content-Type":
                                    "application/json",

                                "Prefer":
                                    "return=minimal"
                            },

                            body:
                                JSON.stringify(
                                    profileData
                                )
                        }

                    );


                if (!updateResponse.ok) {

                    throw new Error(
                        "Profil yangilanmadi"
                    );

                }

            } else {

                const insertResponse =
                    await fetch(

                        SUPABASE_URL +
                        "/rest/v1/profiles",

                        {
                            method: "POST",

                            headers: {
                                "apikey":
                                    SUPABASE_KEY,

                                "Authorization":
                                    "Bearer " +
                                    SUPABASE_KEY,

                                "Content-Type":
                                    "application/json",

                                "Prefer":
                                    "return=minimal"
                            },

                            body:
                                JSON.stringify(
                                    profileData
                                )
                        }

                    );


                if (!insertResponse.ok) {

                    throw new Error(
                        "Profil yaratilmadi"
                    );

                }

            }


            // ==================================
            // PROFIL OYNASINI YANGILASH
            // ==================================

            const profileName =
                document.getElementById(
                    "profileDisplayName"
                );

            const profileUsername =
                document.getElementById(
                    "profileDisplayUsername"
                );

            const profileBio =
                document.getElementById(
                    "profileDisplayBio"
                );

            const profileImage =
                document.getElementById(
                    "profileImage"
                );


            if (profileName) {

                profileName.innerText =
                    displayName;

            }


            if (profileUsername) {

                profileUsername.innerText =
                    username
                        ? "@" + username
                        : "@username";

            }


            if (profileBio) {

                profileBio.innerText =
                    bio;

            }


            if (
                profileImage &&
                avatarUrl
            ) {

                profileImage.innerHTML = `

                    <img
                        src="${avatarUrl}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            border-radius:50%;
                        "
                    >

                `;

            }


            // Tahrirlash oynasini yopish

            const editModal =
                document.getElementById(
                    "editProfileModal"
                );

            if (editModal) {
                editModal.remove();
            }


            alert(
                "Profil muvaffaqiyatli saqlandi ✅"
            );


        } catch (error) {

            console.error(
                "Profil saqlash xatosi:",
                error
            );

            alert(
                "Profil saqlanmadi ❌\n\n" +
                error.message
            );

        }

    }


    // ==========================================
    // SAQLASH TUGMASI
    // ==========================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target &&
                event.target.id ===
                "saveEditedProfile"
            ) {

                saveProfileToDatabase();

            }

        }
    );


    // ==========================================
    // PROFIL OCHILGANDA BAZADAN YUKLASH
    // ==========================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target &&
                event.target.id ===
                "profileButton"
            ) {

                setTimeout(
                    function () {

                        loadProfileFromDatabase();

                    },
                    100
                );

            }

        }
    );


})();
