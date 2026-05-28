'use client';

import { type AuthConsentValues } from '../_schemas/auth';

interface AuthConsentSectionProps {
  title: string;
  description?: string;
  values: AuthConsentValues;
  errors?: Partial<Record<keyof AuthConsentValues, string>>;
  onChange: (field: keyof AuthConsentValues, checked: boolean) => void;
}

const consentItems = [
  {
    field: 'termsAgreed',
    label: '[필수] 서비스 이용약관 동의',
    description: '회원가입 및 서비스 이용을 위한 기본 약관입니다.',
  },
  {
    field: 'privacyAgreed',
    label: '[필수] 개인정보 수집 및 이용 동의',
    description: '계정 생성, 로그인, 고객 응대를 위한 최소 정보를 처리합니다.',
  },
  {
    field: 'marketingAgreed',
    label: '[선택] 이벤트 및 혜택 안내 수신 동의',
    description: '프로모션, 이벤트, 신규 소식 안내에 활용됩니다.',
  },
] as const;

export const AuthConsentSection = ({
  title,
  description,
  values,
  errors,
  onChange,
}: AuthConsentSectionProps) => {
  return (
    <fieldset className="space-y-3 rounded-lg border p-4">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}

      <div className="space-y-3">
        {consentItems.map((item) => (
          <div key={item.field} className="space-y-1">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="border-input mt-0.5 h-4 w-4 rounded border"
                checked={values[item.field]}
                onChange={(event) => onChange(item.field, event.target.checked)}
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">{item.label}</span>
                <p className="text-muted-foreground text-xs">{item.description}</p>
              </span>
            </label>

            {errors?.[item.field] && (
              <p className="text-destructive text-sm">{errors[item.field]}</p>
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
};
