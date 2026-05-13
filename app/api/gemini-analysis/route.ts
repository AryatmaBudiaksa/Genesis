import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { IMAGE_ANALYSIS_MODELS } from '@/config/constants';

const litellm = createOpenAI({
  baseURL: process.env.LITELLM_API_BASE || 'http://localhost:4000/v1',
  apiKey: process.env.LITELLM_API_KEY || 'sk-genesis-master-key',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, prompt, analysisType, modelId = 'gemini-native' } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Find selected model
    const selectedModel = IMAGE_ANALYSIS_MODELS.find(m => m.id === modelId);
    if (!selectedModel) {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }

    // Build prompt based on analysis type
    const prompts: Record<string, string> = {
      'object-detection': `Lakukan deteksi objek komprehensif pada gambar ini. Berikan respons JSON terperinci yang berisi:

1. Semua objek yang terdeteksi dengan:
   - Nama/label objek dalam bahasa Indonesia
   - Skor kepercayaan (0-1)
   - Koordinat kotak pembatas (vertices ternormalisasi)
   - Kategori/kelas objek

2. Format respons sebagai:
{
  "detected_objects": [
    {
      "name": "string (Indonesian)",
      "confidence": float,
      "bounding_box": {
        "vertices": [{"x": float, "y": float}]
      },
      "category": "string"
    }
  ],
  "total_objects": integer,
  "image_properties": {
    "dominant_colors": ["color1", "color2"],
    "brightness": "string"
  }
}

Urutkan objek berdasarkan skor kepercayaan (tertinggi terlebih dahulu).`,

      'label-detection': `Lakukan deteksi label komprehensif pada gambar ini. Berikan respons JSON terperinci:

{
  "labels": [
    {
      "name": "string (Indonesian)",
      "confidence": float,
      "category": "string",
      "description": "string"
    }
  ],
  "scene_attributes": {
    "location_type": "string",
    "activity": "string",
    "time_of_day": "string",
    "weather": "string"
  },
  "total_labels": integer
}

Sertakan label untuk objek, aktivitas, suasana, dan konteks. Urutkan berdasarkan kepercayaan tertinggi.`,

      'text-recognition': `Ekstrak dan transkripsi semua teks yang terlihat dalam gambar ini (OCR). Berikan respons JSON:

{
  "text_annotations": [
    {
      "text": "string",
      "confidence": float,
      "language": "string",
      "bounding_box": {
        "vertices": [{"x": float, "y": float}]
      }
    }
  ],
  "full_text": "string (complete text in reading order)",
  "languages_detected": ["language1", "language2"],
  "total_words": integer,
  "total_lines": integer
}

Pertahankan urutan pembacaan yang benar (kiri ke kanan, atas ke bawah).`,

      'face-detection': `Deteksi dan analisis semua wajah dalam gambar ini. Berikan respons JSON terperinci:

{
  "faces": [
    {
      "face_id": integer,
      "confidence": float,
      "bounding_box": {
        "vertices": [{"x": float, "y": float}]
      },
      "attributes": {
        "age_range": "string",
        "gender": "string",
        "emotion": "string",
        "facial_hair": "string",
        "glasses": "string",
        "smile": boolean
      },
      "pose": {
        "roll": float,
        "yaw": float,
        "pitch": float
      }
    }
  ],
  "total_faces": integer,
  "scene_context": "string"
}

Analisis setiap wajah secara detail. Gunakan bahasa Indonesia untuk deskripsi.`,

      'landmark-recognition': `Identifikasi landmark, monumen, atau lokasi terkenal dalam gambar ini. Berikan respons JSON:

{
  "landmarks": [
    {
      "name": "string (Indonesian & English)",
      "confidence": float,
      "location": {
        "country": "string",
        "city": "string",
        "coordinates": "string (if known)"
      },
      "category": "string",
      "description": "string (historical/cultural info)",
      "fun_facts": ["fact1", "fact2"]
    }
  ],
  "architectural_style": "string",
  "estimated_age": "string",
  "cultural_significance": "string"
}

Jika tidak ada landmark terkenal, berikan informasi tentang jenis bangunan/lokasi yang terlihat.`,

      'image-description': `Berikan deskripsi komprehensif dan terperinci tentang gambar ini. Format respons JSON:

{
  "summary": "string (1-2 sentences overview)",
  "detailed_description": "string (comprehensive description)",
  "composition": {
    "foreground": "string",
    "background": "string",
    "focal_point": "string"
  },
  "visual_elements": {
    "colors": ["color1", "color2"],
    "lighting": "string",
    "mood": "string",
    "style": "string"
  },
  "objects_present": ["object1", "object2"],
  "activities": ["activity1", "activity2"],
  "scene_type": "string",
  "quality": {
    "resolution": "string",
    "clarity": "string",
    "composition_quality": "string"
  }
}

Berikan analisis mendalam tentang semua aspek visual gambar.`,

      'visual-qa': prompt ? `Jawab pertanyaan berikut tentang gambar ini secara detail dan akurat:

PERTANYAAN: "${prompt}"

Berikan respons dalam format JSON:
{
  "question": "${prompt}",
  "answer": "string (detailed answer)",
  "confidence": float,
  "supporting_details": ["detail1", "detail2"],
  "relevant_objects": ["object1", "object2"],
  "additional_context": "string"
}

Analisis gambar dengan cermat dan berikan jawaban yang komprehensif.` : 
`Analisis gambar ini dan jawab pertanyaan umum. Format JSON:

{
  "general_analysis": {
    "what": "string (what is shown)",
    "where": "string (location/setting)",
    "when": "string (time/era)",
    "who": "string (people/subjects)",
    "why": "string (purpose/context)"
  },
  "key_elements": ["element1", "element2"],
  "interesting_details": ["detail1", "detail2"]
}`,
    };

    const analysisPrompt = prompts[analysisType as keyof typeof prompts] || prompts['image-description'];

    // Map the selected model to LiteLLM format
    let targetModelId = 'gemini-3-flash-preview';
    if (selectedModel.apiType === 'openrouter') {
        targetModelId = 'openrouter-auto';
    }

    const result = await generateText({
      model: litellm(targetModelId),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt ? prompt : analysisPrompt },
            { type: 'image', image: imageUrl }
          ]
        }
      ],
      temperature: 0.4,
      maxTokens: 2048,
    });

    return NextResponse.json({
      success: true,
      analysisType,
      result: result.text,
      model: selectedModel.name,
      modelId: selectedModel.modelId,
      provider: selectedModel.provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('=== IMAGE ANALYSIS ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze image',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
