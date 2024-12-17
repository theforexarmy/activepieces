import { ActivepiecesError, CopilotProviderType, CopilotSettings, ErrorCode, isNil } from '@activepieces/shared';
import { createOpenAI } from '@ai-sdk/openai';
import { createAzure } from '@ai-sdk/azure';
import { platformService } from '../../platform/platform.service';
import { LanguageModel } from 'ai';
import { FastifyBaseLogger } from 'fastify';

export const modelService = (log: FastifyBaseLogger) => ({
  async getModel(platformId: string): Promise<LanguageModel> {

    try {
      const platform = await platformService.getOneOrThrow(platformId);
      const { copilotSettings } = platform;
      if (isNil(copilotSettings)) {
        throw new ActivepiecesError({
          code: ErrorCode.COPILOT_FAILED,
          params: { message: 'No copilot settings found' },
        });
      }
      const provider = getDefaultProvider(copilotSettings);
      switch (provider) {
        case CopilotProviderType.OPENAI: {
          const provider = copilotSettings.providers[CopilotProviderType.OPENAI];
          return createOpenAI({
            apiKey: provider.apiKey,
          }).chat('gpt-4o');
        }
        case CopilotProviderType.AZURE_OPENAI: {
          const provider = copilotSettings.providers[CopilotProviderType.AZURE_OPENAI];
          return createAzure({
            apiKey: provider.apiKey,
            resourceName: provider.resourceName,
          }).chat(provider.deploymentName);
        }
      }
    } catch (error) {
      log.error('[ModelService] Failed to initialize AI model', { error, platformId });
      if (error instanceof ActivepiecesError) {
        throw error;
      }
      throw new ActivepiecesError({
        code: ErrorCode.COPILOT_FAILED,
        params: { message: error instanceof Error ? error.message : 'Failed to initialize AI model' },
      });
    }
  },
});

function getDefaultProvider(copilotSettings: CopilotSettings): CopilotProviderType {
  if (copilotSettings.providers[CopilotProviderType.OPENAI].apiKey) {
    return CopilotProviderType.OPENAI;
  }
  if (copilotSettings.providers[CopilotProviderType.AZURE_OPENAI].apiKey) {
    return CopilotProviderType.AZURE_OPENAI;
  }
  throw new ActivepiecesError({
    code: ErrorCode.COPILOT_FAILED,
    params: { message: 'No default provider found' },
  });
}
