/**
 * Structured Data (JSON-LD) Component
 *
 * Renders Schema.org structured data as JSON-LD in <script> tags.
 * This helps search engines better understand the content and context of pages.
 *
 * Usage:
 *   <StructuredData data={schemaObject} />
 */

interface StructuredDataProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

export function StructuredData({ data }: StructuredDataProps) {
  // Convert to array if single object
  const dataArray = Array.isArray(data) ? data : [data];

  return (
    <>
      {dataArray.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0), // No whitespace for production
          }}
        />
      ))}
    </>
  );
}
