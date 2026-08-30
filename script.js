const SUPABASE_URL = "https://bbgruqvwkygjwqdocnsb.supabase.co";
const SUPABASE_KEY = "sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat";
const BUCKET = "Videos";

const picker = document.getElementById("videoPicker");
const feed = document.getElementById("feed");

picker.addEventListener("change", async function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
        alert("Faqat video tanlang!");
        picker.value = "";
        return;
    }

    // Yuklanmoqda oynasi
    const box = document.createElement("div");

    box.style.cssText = `
        position:fixed;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
        z-index:99999;
        background:rgba(20,20,20,.95);
        color:white;
        padding:25px 35px;
        border-radius:16px;
        text-align:center;
        font-family:Arial,sans-serif;
        min-width:220px;
        box-shadow:0 5px 30px rgba(0,0,0,.5);
    `;

    box.innerHTML = `
        <div style="font-size:18px;margin-bottom:10px">
            Yuklanmoqda...
        </div>

        <div id="uploadPercent"
             style="font-size:38px;font-weight:bold">
            0%
        </div>
    `;

    document.body.appendChild(box);

    const percent = box.querySelector("#uploadPercent");

    const extension =
        file.name.includes(".")
            ? file.name.substring(file.name.lastIndexOf("."))
            : ".mp4";

    const fileName =
        Date.now() + "_" +
        Math.random().toString(36).substring(2, 8) +
        extension;

    const uploadUrl =
        `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(fileName)}`;

    const xhr = new XMLHttpRequest();

    xhr.open("POST", uploadUrl, true);

    xhr.setRequestHeader(
        "Authorization",
        `Bearer ${SUPABASE_KEY}`
    );

    xhr.setRequestHeader(
        "apikey",
        SUPABASE_KEY
    );

    xhr.setRequestHeader(
        "Content-Type",
        file.type || "video/mp4"
    );

    xhr.setRequestHeader(
        "x-upsert",
        "false"
    );

    // FOIZ
    xhr.upload.addEventListener("progress", function (event) {

        if (event.lengthComputable) {

            const progress =
                Math.round(
                    (event.loaded / event.total) * 100
                );

            percent.textContent = progress + "%";
        }

    });

    xhr.onload = function () {

        console.log("Supabase status:", xhr.status);
        console.log("Supabase response:", xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {

            percent.textContent = "100%";

            box.innerHTML = `
                <div style="font-size:32px">
                    ✅
                </div>

                <div style="font-size:18px;margin-top:8px">
                    Yuklandi
                </div>
            `;

            setTimeout(function () {

                box.remove();

                showVideo(fileName);

            }, 800);

        } else {

            let message = "Yuklashda xato";

            try {
                const data = JSON.parse(xhr.responseText);

                if (data.message) {
                    message = data.message;
                }

                if (data.error) {
                    message = data.error;
                }

            } catch (e) {}

            box.innerHTML = `
                <div style="font-size:32px">
                    ❌
                </div>

                <div style="font-size:17px;margin-top:8px">
                    ${message}
                </div>

                <div style="font-size:12px;margin-top:8px;opacity:.7">
                    Xato kodi: ${xhr.status}
                </div>
            `;

        }
    };

    xhr.onerror = function () {

        box.innerHTML = `
            <div style="font-size:32px">
                ❌
            </div>

            <div style="font-size:17px;margin-top:8px">
                Internet xatosi
            </div>
        `;

    };

    xhr.ontimeout = function () {

        box.innerHTML = `
            <div style="font-size:32px">
                ❌
            </div>

            <div style="font-size:17px;margin-top:8px">
                Yuklash vaqti tugadi
            </div>
        `;

    };

    // Video yuklashni boshlash
    xhr.send(file);

    picker.value = "";
});


// Yuklangan videoni ekranga chiqarish
function showVideo(fileName) {

    // Oldingi aktiv videolarni o‘chirish
    document
        .querySelectorAll(".video.active")
        .forEach(function (item) {
            item.classList.remove("active");
        });

    const videoBox = document.createElement("div");

    videoBox.className = "video active";

    const video = document.createElement("video");

    video.src =
        `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(fileName)}`;

    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.controls = true;

    videoBox.appendChild(video);

    feed.appendChild(videoBox);

    video.play().catch(function (error) {
        console.log("Video ishga tushmadi:", error);
    });
        }
