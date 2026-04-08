'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import { emailTemplateApi, EmailTemplate, CreateEmailTemplateDto, UpdateEmailTemplateDto } from '@/services/api/emailTemplateApi';

// Dinamik import - Monaco Editor SSR ile çalıştırılmaz
const Editor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

interface LocalEmailTemplate extends EmailTemplate {
  version?: number;
}

interface PreviewVariables {
  [key: string]: string;
}

export default function EmailTemplatesEditor() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.templateId as string;
  const isCreate = templateId === 'create';

  const [template, setTemplate] = useState<LocalEmailTemplate | null>(null);
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<PreviewVariables>({
    userName: 'Test Kullanıcı',
    resetUrl: 'https://example.com/reset?token=abc123def456',
    expiryMinutes: '30',
    supportUrl: 'https://support.example.com'
  });
  const [previewHtml, setPreviewHtml] = useState<string>('');

  // Fetch template if editing
  useEffect(() => {
    if (!isCreate && templateId) {
      fetchTemplate();
    } else if (isCreate) {
      setTemplate({
        templateKey: 'NEW_TEMPLATE',
        name: 'Yeni Şablon',
        mjmlContent: '<mjml>\n  <mj-body>\n    <mj-section>\n      <mj-column>\n        <mj-text>Merhaba {{userName}}</mj-text>\n      </mj-column>\n    </mj-section>\n  </mj-body>\n</mjml>',
        subject: 'Yeni Email',
        version: 1,
        isActive: true,
        supportedVariables: ['userName']
      });
      setLoading(false);
    }
  }, [templateId, isCreate]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const data = await emailTemplateApi.getTemplateById(parseInt(templateId));
      setTemplate(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şablon yüklenemedi');
      toast.error('Şablon yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;

    setSaving(true);
    try {
      if (isCreate) {
        const payload: CreateEmailTemplateDto = {
          templateKey: template.templateKey,
          name: template.name,
          mjmlContent: template.mjmlContent,
          subject: template.subject
        };
        const savedTemplate = await emailTemplateApi.createTemplate(payload);
        setTemplate(savedTemplate);
        toast.success('Şablon oluşturuldu');
        router.push(`/admin/email-templates/${savedTemplate.id}`);
      } else {
        const payload: UpdateEmailTemplateDto = {
          name: template.name,
          mjmlContent: template.mjmlContent,
          subject: template.subject,
          isActive: template.isActive || true
        };
        const savedTemplate = await emailTemplateApi.updateTemplate(template.id || 0, payload);
        setTemplate(savedTemplate);
        toast.success('Şablon kaydedildi');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err instanceof Error ? err.message : 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!template || !template.id) {
      toast.warning('Önizlemeden önce şablonu kaydedin');
      return;
    }

    try {
      const html = await emailTemplateApi.previewTemplate(template.id, previewVariables);
      setPreviewHtml(html);
      setShowPreview(true);
      toast.success('Önizleme yüklendi');
    } catch (err) {
      console.error('Preview error:', err);
      toast.error('Önizleme oluşturulamadı');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isCreate ? '📧 Yeni Email Şablonu' : `📧 ${template.name}`}
          </h1>
          <p className="text-gray-600 mt-1">
            {isCreate ? 'Yeni bir email şablonu oluşturun' : `Sürüm: ${template.version}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Geri
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Template Key
            </label>
            <input
              type="text"
              value={template.templateKey}
              onChange={(e) => setTemplate({ ...template, templateKey: e.target.value })}
              disabled={!isCreate}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
              placeholder="PASSWORD_RESET"
            />
            <p className="text-xs text-gray-500 mt-1">
              Bir kez ayarlandığında değiştirilemez
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Şablon Adı
            </label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Şifre Sıfırlama Emaili"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="FAS: Şifrenizi Sıfırlayın"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              MJML Content
            </label>
            <Editor
              height="400px"
              defaultLanguage="xml"
              value={template.mjmlContent}
              onChange={(value) => {
                if (value) {
                  setTemplate({ ...template, mjmlContent: value });
                }
              }}
              theme="vs-light"
              options={{ minimap: { enabled: false } }}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handlePreview}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              👁️ Önizle
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
            </button>
          </div>
        </div>

        {/* Preview & Variables Panel */}
        <div className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📋 Önizleme Değişkenleri
            </h3>
            <div className="space-y-2">
              {Object.entries(previewVariables).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {'{{'}{key}{'}'}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setPreviewVariables({
                        ...previewVariables,
                        [key]: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {showPreview && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📧 Email Önizlemesi
              </h3>
              <iframe
                title="email-preview"
                srcDoc={previewHtml}
                className="w-full h-96 border border-gray-300 rounded"
                style={{ border: '1px solid #ddd' }}
              />
            </div>
          )}

          {template.supportedVariables && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                ✓ Desteklenen Değişkenler
              </h4>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  try {
                    const vars = typeof template.supportedVariables === 'string' 
                      ? JSON.parse(template.supportedVariables) 
                      : template.supportedVariables;
                    return Array.isArray(vars) && vars.length > 0 ? (
                      vars.map((variable) => (
                        <span
                          key={variable}
                          className="px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded"
                        >
                          {'{{'}{variable}{'}'}
                        </span>
                      ))
                    ) : null;
                  } catch {
                    return null;
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
