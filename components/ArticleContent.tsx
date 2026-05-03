'use client';

import { useEffect, useRef } from 'react';

interface ArticleContentProps {
  html: string;
  className?: string;
}

export default function ArticleContent({ html, className }: ArticleContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = ref.current;
    if (!area) return;

    const tables = area.querySelectorAll<HTMLTableElement>('table');
    tables.forEach((table) => {
      // Skip if already wrapped
      if (
        table.parentNode &&
        (table.parentNode as HTMLElement).classList?.contains('table-scroll-wrapper')
      ) return;

      // Create hint element
      const hint = document.createElement('div');
      hint.className = 'table-scroll-hint';
      hint.innerHTML =
        'Geser untuk melihat selengkapnya &rsaquo; ' +
        '<span class="scroll-arrows">' +
        '<span></span><span></span><span></span>' +
        '</span>';

      // Create wrapper element
      const wrapper = document.createElement('div');
      wrapper.className = 'table-scroll-wrapper';

      // Insert hint and wrapper before the table
      table.parentNode!.insertBefore(hint, table);
      table.parentNode!.insertBefore(wrapper, table);

      // Move table into wrapper
      wrapper.appendChild(table);
    });
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
