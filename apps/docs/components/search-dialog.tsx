"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import type { SharedProps, TagItem } from "fumadocs-ui/contexts/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
} from "fumadocs-ui/components/dialog/search";
import { useMemo, useState, type ReactNode } from "react";

export type DocsSearchDialogProps = SharedProps & {
  api?: string;
  delayMs?: number;
  defaultTag?: string;
  tags?: TagItem[];
  allowClear?: boolean;
  links?: [string, string][];
  footer?: ReactNode;
};

/**
 * Custom search dialog: tag chips must live inside DialogContent.
 * Fumadocs' default puts them in a sibling footer, which stays visible on the page
 * when the dialog is closed.
 */
export function DocsSearchDialog({
  api = "/api/search",
  delayMs,
  defaultTag,
  tags = [],
  allowClear = false,
  links = [],
  footer,
  ...props
}: DocsSearchDialogProps) {
  const { locale } = useI18n();
  const [tag, setTag] = useState(defaultTag);

  // Use the typed client preset so tag/locale stay in the hook's deps correctly.
  const { search, setSearch, query } = useDocsSearch({
    type: "fetch",
    api,
    locale,
    tag,
    delayMs,
  });

  const defaultItems = useMemo(() => {
    if (links.length === 0) return null;
    return links.map(([name, link]) => ({
      type: "page" as const,
      id: name,
      content: name,
      url: link,
    }));
  }, [links]);

  useOnChange(defaultTag, (v) => {
    setTag(v);
  });

  return (
    <SearchDialog
      {...props}
      search={search ?? ""}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        {tags.length > 0 || footer ? (
          <SearchDialogFooter>
            {tags.length > 0 ? (
              <TagsList tag={tag} onTagChange={setTag} allowClear={allowClear}>
                {tags.map((item) => (
                  <TagsListItem key={item.value} value={item.value}>
                    {item.name}
                  </TagsListItem>
                ))}
              </TagsList>
            ) : null}
            {footer}
          </SearchDialogFooter>
        ) : null}
        <SearchDialogList items={query.data !== "empty" ? query.data : defaultItems} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
