'use server'

import { GeminiClient, type CodegenRequest, type CodegenResult, type EmbeddingRequest, type EmbeddingResult, type QuestionAnswerRequest, type QuestionAnswerResult, type SceneExtractionRequest, type SceneExtractionResult } from '../../backend/src/gemini/client'
import { GEMINI_API_KEY } from './env'

let client: GeminiClient | null = null

function getClient(): GeminiClient {
  if (!client) {
    client = new GeminiClient({ apiKey: GEMINI_API_KEY })
  }
  return client
}

export async function extractScene(request: SceneExtractionRequest): Promise<SceneExtractionResult> {
  return getClient().extractStep(request)
}

export async function generateThreeCode(request: CodegenRequest): Promise<CodegenResult> {
  return getClient().generateThreeCode(request)
}

export async function answerQuestion(request: QuestionAnswerRequest): Promise<QuestionAnswerResult> {
  return getClient().answerQuestion(request)
}

export async function embedTexts(request: EmbeddingRequest): Promise<EmbeddingResult> {
  return getClient().embed(request)
}

export type {
  SceneExtractionRequest,
  SceneExtractionResult,
  CodegenRequest,
  CodegenResult,
  QuestionAnswerRequest,
  QuestionAnswerResult,
  EmbeddingRequest,
  EmbeddingResult,
} from '../../backend/src/gemini/client'
