"use client";

import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const SECTION_DATA = [
  { key: "header", title: "John Doe", subtitle: "Senior Software Engineer" },
  { key: "experience", title: "Work Experience", items: 3 },
  { key: "education", title: "Education", items: 2 },
  { key: "skills", title: "Technical Skills", items: 4 },
  { key: "projects", title: "Key Projects", items: 3 },
];

const morph = keyframes`
  0% { opacity: 0; transform: scale(0.8) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ResumeContainer = styled.div`
  font-family: "Segoe UI", sans-serif;
  max-width: 800px;
  margin: 2rem auto;
  position: relative;
`;

const Section = styled.div<{ $isActive: boolean }>`
  padding: 1.5rem;
  margin: 1rem;
  border-radius: 12px;
  background: ${({ $isActive }) =>
    $isActive
      ? "#fff"
      : "#fff"};
  background-size: ${({ $isActive }) => ($isActive ? "400% 400%" : "auto")};
  animation: ${({ $isActive }) =>
    $isActive ? `${gradientFlow} 6s ease infinite` : "none"};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $isActive }) => ($isActive ? "scale(1.02)" : "scale(0.98)")};
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.6)};
  cursor: pointer;
  box-shadow: ${({ $isActive }) =>
    $isActive
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      : "none"};

  &:hover {
    transform: scale(1.01);
  }
`;

const SkeletonLine = styled.div`
  height: 16px;
  background: #e5e7eb;
  border-radius: 4px;
  margin: 0.5rem 0;
  animation: ${morph} 0.3s ease-out;

  &:nth-child(odd) {
    width: 80%;
  }
  &:nth-child(even) {
    width: 70%;
  }
`;

const HeaderSection = styled(Section)`
  text-align: center;
  background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
  border-bottom: 3px solid #d1d5db;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  position: relative;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 2px;
    background: #3b82f6;
    transition: width 0.3s ease;
  }

  ${Section}:hover &::after {
    width: 60px;
  }
`;

export const ResumeHighlighter = ({ activeKey }: { activeKey: string }) => {
  const [prevKey, setPrevKey] = useState(activeKey);
  const [layoutVersion, setLayoutVersion] = useState(0);

  useEffect(() => {
    setLayoutVersion((prev) => prev + 1);
    setPrevKey(activeKey);
  }, [activeKey]);

  return (
    <ResumeContainer key={layoutVersion}>
      {SECTION_DATA.map((section) => (
        <Section key={section.key} $isActive={section.key === activeKey}>
          {section.key === "header" ? (
            <HeaderSection $isActive={section.key === activeKey}>
              <h1>{section.title}</h1>
              <p>{section.subtitle}</p>
            </HeaderSection>
          ) : (
            <>
              <SectionTitle>{section.title}</SectionTitle>
              {[...Array(section.items)].map((_, i) => (
                <SkeletonLine key={i} />
              ))}
            </>
          )}
        </Section>
      ))}
    </ResumeContainer>
  );
};
 
