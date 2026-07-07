import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Card } from '../components/ui/Card';
import { useCreatePresentation } from '../hooks/usePresentations';
import type {
  PresentationTheme,
  PresentationTone,
  PresentationStyle,
} from '../types/presentation.types';

const THEMES = [
  { value: 'MINIMAL', label: 'Minimal', description: 'Clean & spacious' },
  { value: 'CORPORATE', label: 'Corporate', description: 'Polished & formal' },
  { value: 'CREATIVE', label: 'Creative', description: 'Vivid & expressive' },
  { value: 'DARK', label: 'Dark', description: 'Bold dark mode' },
  { value: 'ACADEMIC', label: 'Academic', description: 'Structured & precise' },
];

const TONES = [
  { value: 'FORMAL', label: 'Formal', description: 'Professional language' },
  { value: 'CASUAL', label: 'Casual', description: 'Relaxed & friendly' },
  { value: 'INFORMATIVE', label: 'Informative', description: 'Fact-driven, neutral' },
  { value: 'PERSUASIVE', label: 'Persuasive', description: 'Convincing & benefit-led' },
];

const STYLES = [
  { value: 'MINIMAL', label: 'Minimal', description: 'Short bullet points' },
  { value: 'PROFESSIONAL', label: 'Professional', description: 'Structured business copy' },
  { value: 'CREATIVE', label: 'Creative', description: 'Vivid, engaging phrasing' },
  { value: 'BOLD', label: 'Bold', description: 'Punchy, high-impact' },
];

export function CreatePresentationPage() {
  const navigate = useNavigate();
  const createMutation = useCreatePresentation();

  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [language, setLanguage] = useState('English');
  const [slideCount, setSlideCount] = useState(6);
  const [theme, setTheme] = useState<PresentationTheme>('MINIMAL');
  const [tone, setTone] = useState<PresentationTone>('INFORMATIVE');
  const [style, setStyle] = useState<PresentationStyle>('PROFESSIONAL');
  const [instructions, setInstructions] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createMutation.mutateAsync({
      topic,
      audience,
      language,
      slideCount,
      theme,
      tone,
      style,
      customInstructions: instructions || undefined,
    });
    navigate(`/presentations/${result.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create a new presentation</h1>
          <p className="text-sm text-muted-foreground">Tell us what you need — AI handles the rest.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-5">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. The Future of Remote Work"
                required
                minLength={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="audience">Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g. HR leaders & executives"
                  required
                  minLength={2}
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </Select>
              </div>
            </div>

            <div>
              <Label>Number of slides</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSlideCount((c) => Math.max(1, c - 1))}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="flex-1">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full accent-[hsl(var(--primary))]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSlideCount((c) => Math.min(10, c + 1))}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>

                <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold">
                  {slideCount}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Choose between 1 and 10 slides.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Label className="mb-3">Visual theme</Label>
          <SegmentedControl options={THEMES} value={theme} onChange={(v) => setTheme(v as PresentationTheme)} columns={4} keyPrefix="theme" />
        </Card>

        <Card className="p-6">
          <Label className="mb-3">Tone of voice</Label>
          <SegmentedControl options={TONES} value={tone} onChange={(v) => setTone(v as PresentationTone)} columns={4} keyPrefix="tone" />
        </Card>

        <Card className="p-6">
          <Label className="mb-3">Writing style</Label>
          <SegmentedControl options={STYLES} value={style} onChange={(v) => setStyle(v as PresentationStyle)} columns={4} keyPrefix="style" />
        </Card>

        <Card className="p-6">
          <Label htmlFor="instructions">Additional requirements (optional)</Label>
          <Textarea
            id="instructions"
            placeholder="e.g. Focus on examples from the Indian startup ecosystem, include relevant statistics, keep slide 1 as an executive summary…"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            maxLength={1000}
          />
          <p className="mt-1.5 text-right text-xs text-muted-foreground">{instructions.length}/1000</p>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="gap-1.5" isLoading={createMutation.isPending}>
            <Sparkles className="h-4 w-4" />
            Generate presentation
          </Button>
        </div>
      </form>
    </div>
  );
}
