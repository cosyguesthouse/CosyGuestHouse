import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '@/i18n';

interface TranslateProps {
  text: string;
}

export const Translate: React.FC<TranslateProps> = ({ text }) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      if (!text) return;
      if (i18n.language === 'en') {
        if (isMounted) setTranslatedText(text);
        return;
      }
      const result = await translateText(text, i18n.language);
      if (isMounted) setTranslatedText(result);
    };

    translate();

    return () => {
      isMounted = false;
    };
  }, [text, i18n.language]);

  return <>{translatedText}</>;
};
