'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useState, useEffect } from 'react';

interface Section {
  id: number;
  secao: string;
  descricao: string;
  texto?: string;
}

interface PrivacyPolicyPDFProps {
  sections: Section[];
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#666',
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
    color: '#333',
  },
  content: {
    fontSize: 12,
    marginBottom: 12,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecoration: 'underline',
  },
  list: {
    marginLeft: 20,
    marginBottom: 8,
  },
  listItem: {
    marginBottom: 4,
  },
});

const processNode = (node: Node, key: string): React.ReactNode | React.ReactNode[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (text) {
      return <Text key={key} style={styles.content}>{text}</Text>;
    }
    return <></>;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    
    switch (element.tagName.toLowerCase()) {
      case 'p':
        return (
          <View key={key} style={{ marginBottom: 8 }}>
            {Array.from(element.childNodes).map((child, i) => 
              processNode(child, `${key}-${i}`)
            )}
          </View>
        );
      case 'strong':
      case 'b':
        return <Text key={key} style={[styles.content, styles.bold]}>{element.textContent}</Text>;
      case 'em':
      case 'i':
        return <Text key={key} style={[styles.content, styles.italic]}>{element.textContent}</Text>;
      case 'u':
        return <Text key={key} style={[styles.content, styles.underline]}>{element.textContent}</Text>;
      case 'ul':
      case 'ol':
        return (
          <View key={key} style={styles.list}>
            {Array.from(element.children).map((li, i) => (
              <View key={`${key}-${i}`} style={styles.listItem}>
                <Text style={styles.content}>
                  {element.tagName.toLowerCase() === 'ol' ? `${i + 1}. ` : '• '}
                  {li.textContent}
                </Text>
              </View>
            ))}
          </View>
        );
      case 'br':
        return <Text key={key} style={styles.content}>{'\n'}</Text>;
      default:
        return Array.from(element.childNodes).map((child, i) => 
          processNode(child, `${key}-${i}`)
        );
    }
  }
  return <></>;
};

function parseHTML(html: string): React.ReactNode[] {
  if (typeof window === 'undefined') return [];

  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return Array.from(tempDiv.childNodes).map((node, i) => 
      processNode(node, `node-${i}`)
    );
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
}

export default function PrivacyPolicyPDF({ sections }: PrivacyPolicyPDFProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {section.secao.replace(/^\d+\s*-\s*/, '')}
            </Text>
            <Text style={styles.description}>{section.descricao}</Text>
            {section.texto && (
              <View>
                {parseHTML(section.texto)}
              </View>
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
} 