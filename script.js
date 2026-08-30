const SUPABASE_URL = "https://bbgruqvwkygjwqdocnsb.supabase.co";
const SUPABASE_KEY = "sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat";
const BUCKET = "Videos";

const picker = document.getElementById("videoPicker");
const feed = document.getElementById("feed");

picker.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
        alert("Faqat video tanlang!");
        return;
    }

    // Yuklanmoqda oynasi
    const box = document.createElement("div");

    box.id = "uploadBox";

    box.style.cssText = `
        position:fixed;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
        z-index:99999;
        background:#222;
        color:white;
        padding:25px 35px;
        border-radius:15px;
        text-align:center;
        font-family:Arial;
        min-width:220px;
    `;

    box.innerHTML = `
        <div style="font-size:18px;margin-bottom:10px">
            Yuklanmoqda...
        </div>

        <div id="uploadPercent"
             style="font-size:35px;font-weight:bold">
            0%
        </div>
    `;

    document.body.appendChild(box);

    const percent =
        document.getElementById("uploadPercent");

    const fileName =
        Date.now() + "_" +
        file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const url =
        SUPABASE_URL +
        "/storage/v1/object/" +
        BUCKET +
        "/" +
        encodeURIComponent(fileName);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);

    xhr.setRequestHeader(
        "Authorization",
        "Bearer " + SUPABASE_KEY
    );

    xhr.setRequestHeader(
        "apikey",
        SUPABASE_KEY
    );

    xhr.setRequestHeader(
        "Content-Type",
        file.type
    );

    xhr.upload.onprogress = function (event) {

        if (event.lengthComputable) {

            const p =
                Math.round(
                    (event.loaded / event.total) * 100
                );

            percent.textContent = p + "%";
        }
    };

    xhr.onload = function () {

        console.log("STATUS:", xhr.status);
        console.log("RESPONSE:", xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {

            percent.textContent = "100%";

            setTimeout(function () {

                box.innerHTML = `
                    <div style="font-size:30px">
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

            }, 300);

        } else {

            box.innerHTML = `
                <div style="font-size:30px">
                    ❌
                </div>

                <div style="margin-top:8px">
                    Yuklashda xato
                </div>

                <div style="font-size:12px;margin-top:10px">
                    ${xhr.status}
                </div>
            `;

            console.log(
                "Supabase xatosi:",
                xhr.responseText
            );
        }
    };

    xhr.onerror = function () {

        box.innerHTML = `
            <div style="font-size:30px">
                ❌
            </div>

            <div style="margin-top:8px">
                Internet yoki server xatosi
            </div>
        `;
    };

    xhr.send(file);

    picker.value = "";
});


function showVideo(fileName) {

    const videoBox =
        document.createElement("div");

    videoBox.className = "video active";

    const video =
        document.createElement("video");

    video.src =
        SUPABASE_URL +
        "/storage/v1/object/public/" +
        BUCKET +
        "/" +
        encodeURIComponent(fileName);

    video.controls = true;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    videoBox.appendChild(video);

    feed.appendChild(videoBox);

    video.play().catch(function(error) {
        console.log("Video play xatosi:", error);
    });
}
