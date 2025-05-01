'use client';

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

function parseHTML(html: string): JSX.Element[] {
  if (typeof window === 'undefined') return [];

  try {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const elements: JSX.Element[] = [];

    function processNode(node: Node, key: string): void {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          elements.push(
            <Text key={key} style={styles.content}>
              {text}
            </Text>
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        
        switch (element.tagName.toLowerCase()) {
          case 'p':
            elements.push(
              <View key={key} style={{ marginBottom: 8 }}>
                {Array.from(element.childNodes).map((child, i) => 
                  processNode(child, `${key}-${i}`)
                )}
              </View>
            );
            break;
          case 'strong':
          case 'b':
            elements.push(
              <Text key={key} style={[styles.content, styles.bold]}>
                {element.textContent}
              </Text>
            );
            break;
          case 'em':
          case 'i':
            elements.push(
              <Text key={key} style={[styles.content, styles.italic]}>
                {element.textContent}
              </Text>
            );
            break;
          case 'u':
            elements.push(
              <Text key={key} style={[styles.content, styles.underline]}>
                {element.textContent}
              </Text>
            );
            break;
          case 'ul':
          case 'ol':
            elements.push(
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
            break;
          case 'br':
            elements.push(
              <Text key={key} style={styles.content}>
                {'\n'}
              </Text>
            );
            break;
          default:
            Array.from(element.childNodes).forEach((child, i) => 
              processNode(child, `${key}-${i}`)
            );
        }
      }
    }

    Array.from(tempDiv.childNodes).forEach((node, i) => 
      processNode(node, `node-${i}`)
    );

    return elements;
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
        <Text style={styles.title}>Política de Proteção de Dados Pessoais</Text>
        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {section.id} - {section.secao}
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