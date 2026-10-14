// import package-nya si dotenv
import "dotenv/config";

import multer from "multer";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

const app = express();
const upload = multer({
  limits: {
    fileSize: 1_000_000
  }
});
const ai = new GoogleGenAI();

// inisialisasi aplikasi
app
.use(upload.single('file')) // inisialisasi multer dengan single `file` upload
// method chaining
.use(cors())
.use(express.json()) // kita bisa terima header `Content-Type: application/json`
.use(express.static("static"))
// inisialisasi routes + handler
// endpoint 1: POST /api/generate-text
.post("/api/generate-text", async (req, res) => {
  const { prompt } = req.body;
  

  // try-catch: kita coba/`try` dulu, kalau error, kita jalanin `catch`-nya
  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.1-flash-lite',
      input: prompt,
      //template literals -->``
      system_instruction: `
      kamu adalah AI agent yang bekerja di Workshop Rakit Sepeda Custom bernama Navy Bike Project
      
      tone kamu harus berupa seperti berikut:
      - Friendly dan ramah meski dijawab sekasar kasarnya
      - harus dijawab dengan bahasa yang padat singkat dan jelas tapi tidak menghilangkan keramahan kamu
      
      navy bike project adalah workshop rakit sepeda custom yang melayani jasa rakit sepeda custom, jual beli sparepart sepeda, dan jual beli sepeda second yang beralamatkan di jalan gn.Bromo I no.58, Perumnas Kota cirebon.
      sepeda custom yang dibuat disini adalah sepeda mtb jadul basic federal dengan keranjang tambahan, yang biasa disebut dengan sepeda kalcer
      harga sepeda custom bervariasi dari mulai 2.500.000 dampai 5.000.000 untuk tipe sepedad kalcer federal, dan harga mulai dari 3.000.000 untuk sepeda model road bike
      selain itu, navy bike project juga melayani jasa servis sepeda, baik itu servis ringan maupun servis berat, dan juga melayani jasa modifikasi sepeda sesuai permintaan customer (restorasi)
      customer dapat request bentuk frame, warna frame, warna decal, warna kabel,warna veld,dll
      
      untuk restorasi sepeda lama kamu bisa bawa sepeda nya ke workshop langsung ya, nanti ada tim teknis yang bantu hitungkan estimasi biaya nya
      lama pengerjaan custom sepeda itu 14 sampai 16 hari kerja ya

      waktu operasional navy bike project itu dari jam 09.00 sampai jam 20.00 WIB, dan tutup di hari minggu
      
      untuk batasan-batasanya:
      - harus ikuti konteks yang ditentukan diatas 
      - balasan tidak boleh lebih dari 30 karakter 
      `
    });

    return res.status(200).json({
      success: true,
      message: interaction.output_text
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Wah, ada masalah nih! Developer, tolong cek console log-nya ya!"
    });
  }
})
// endpoint 2: POST /api/process-media
.post("/api/process-media", async (req, res) => {
  const { prompt } = req.body;
  

  // ambil file dengan req.file.buffer.toString("base64");
  const base64File = req.file?.buffer.toString("base64");

  // tentukan tipe file secara dinamis (image, audio, video, atau document)
  const mimeType = req.file?.mimetype || "";
  let fileType = "document";
  if (mimeType.startsWith("image/")) {
    fileType = "image";
  } else if (mimeType.startsWith("audio/")) {
    fileType = "audio";
  } else if (mimeType.startsWith("video/")) {
    fileType = "video";
  }

  // try-catch: kita coba/`try` dulu, kalau error, kita jalanin `catch`-nya
  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.1-flash-lite',
      // kita buat input-nya dalam bentuk array
      input: [
        // untuk type text, nanti kita butuh `text`
        { type: "text", text: prompt },
        // untuk type media (image/audio/video/document), kita butuh `data` dan `mime_type`
        { type: fileType, data: base64File, mime_type: req.file?.mimetype }
      ]
    });

    return res.status(200).json({
      success: true,
      message: interaction.output_text
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Wah, ada masalah nih! Developer, tolong cek console log-nya ya!"
    });
  }
})
// endpoint 3: POST /api/chat
.post("/api/chat", async (req, res) => {
  const { prompt, interaction_id } = req.body;

  // satpam 1-- cek prompt ada isi atau gak
  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: "eeiiits...promptnya harus diisi dulu ya!"
    }); 
  } // <-- PERBAIKAN 1: Tanda kurung kurawal ditutup di sini

  // ambil file dengan req.file.buffer.toString("base64");
  const base64File = req.file?.buffer.toString("base64");

  // tentukan tipe file secara dinamis (image, audio, video, atau document)
  const mimeType = req.file?.mimetype || "";
  let fileType = "document";
  if (mimeType.startsWith("image/")) {
    fileType = "image";
  } else if (mimeType.startsWith("audio/")) {
    fileType = "audio";
  } else if (mimeType.startsWith("video/")) {
    fileType = "video";
  }

  if (prompt === "Customer Support") {
    return res.status(200).json({
      success: true,
      message: "oke,sebentar ya..saya akan sambungkan dengan customer service"  
      //change_to_customer_service: true
    });
  }

  // try-catch: kita coba/`try` dulu, kalau error, kita jalanin `catch`-nya
  try {
    // Siapkan array input dasar dengan teks prompt
    const aiInput = [{ type: "text", text: prompt }];

    // PERBAIKAN 2: Hanya masukkan objek file jika ada file yang diunggah (mencegah error jika req.file kosong)
    if (req.file) {
      aiInput.push({ type: fileType, data: base64File, mime_type: req.file.mimetype });
    }

    const interaction = await ai.interactions.create({
      model: 'gemini-3.1-flash-lite',
      input: prompt,
      system_instruction:`
      kamu adalah AI agent yang bekerja di Workshop Rakit Sepeda Custom bernama Navy Bike Project
      
      tone kamu harus berupa seperti berikut:
      - Friendly dan ramah meski dijawab sekasar kasarnya
      - harus dijawab dengan bahasa yang padat singkat dan jelas tapi tidak menghilangkan keramahan kamu
      
      navy bike project adalah workshop rakit sepeda custom yang melayani jasa rakit sepeda custom, jual beli sparepart sepeda, dan jual beli sepeda second yang beralamatkan di jalan gn.Bromo I no.58, Perumnas Kota cirebon.
      sepeda custom yang dibuat disini adalah sepeda mtb jadul basic federal dengan keranjang tambahan, yang biasa disebut dengan sepeda kalcer
      harga sepeda custom bervariasi dari mulai 2.500.000 dampai 5.000.000 untuk tipe sepedad kalcer federal, dan harga mulai dari 3.000.000 untuk sepeda model road bike
      selain itu, navy bike project juga melayani jasa servis sepeda, baik itu servis ringan maupun servis berat, dan juga melayani jasa modifikasi sepeda sesuai permintaan customer (restorasi)
      customer dapat request bentuk frame, warna frame, warna decal, warna kabel,warna veld,dll
      
      untuk batasan-batasanya:
      - harus ikuti konteks yang ditentukan diatas 
      - balasan tidak boleh lebih dari 500 karakter 
      `,
      previous_interaction_id: interaction_id,
    });

    return res.status(200).json({
      success: true,
      message: interaction.output_text,
      interaction_id: interaction.id
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Wah, ada masalah nih! Developer, tolong cek console log-nya ya!"
    });
  }
})

// bungkus gan!
.listen(PORT, () => {
  console.log("Bungkus gan, di port", PORT);
});
