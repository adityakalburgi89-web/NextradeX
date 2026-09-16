import { buildTopicUrl } from '../webSocketUtils';
test('buildTopicUrl appends slash if missing', () => { expect(buildTopicUrl('topic')).toBe('/topic'); });
