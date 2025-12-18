const { initDatabase, saveDatabase, getDatabase, closeDatabase } = require( '../db/database' );

const SCHEMA = `
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id INTEGER NULL REFERENCES pages(id),
  layout_type TEXT NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
`;

const SEED_DATA = [
    // Home page (id=1)
    { title: 'Home', slug: 'home', parent_id: null, layout_type: 'landing', content: '# Welcome to Generative AI Learning\n\nComprehensive curriculum covering GenAI, LLMs, training techniques, and practical applications.', order_index: 0, status: 'published' },

    // 1. Introduction to GenAI (id=2)
    { title: 'Introduction to GenAI', slug: 'introduction-to-genai', parent_id: null, layout_type: 'doc', content: '# Introduction to GenAI\n\nFundamental concepts of Generative AI.', order_index: 1, status: 'published' },

    // 1.1 Introduction to GenAI (id=3, parent=2)
    { title: 'Introduction to GenAI', slug: 'intro-to-genai-overview', parent_id: 2, layout_type: 'doc', content: '# Introduction to GenAI\n\nCore concepts and overview.', order_index: 0, status: 'published' },
    { title: 'Defining AI, Gen AI', slug: 'defining-ai-gen-ai', parent_id: 3, layout_type: 'doc', content: '# Defining AI, Gen AI', order_index: 0, status: 'published' },
    { title: 'Generative AI vs Predictive AI', slug: 'generative-vs-predictive-ai', parent_id: 3, layout_type: 'doc', content: '# Generative AI vs Predictive AI\n\nCore differences and use-case scenarios.', order_index: 1, status: 'published' },
    { title: 'History and Evolution of Generative AI', slug: 'history-evolution-genai', parent_id: 3, layout_type: 'doc', content: '# History and Evolution of Generative AI', order_index: 2, status: 'published' },
    { title: 'Key Characteristics and Capabilities of GenAI', slug: 'key-characteristics-genai', parent_id: 3, layout_type: 'doc', content: '# Key Characteristics and Capabilities of GenAI', order_index: 3, status: 'published' },
    { title: 'Notion of AGI', slug: 'notion-of-agi', parent_id: 3, layout_type: 'doc', content: '# Notion of AGI (Artificial General Intelligence)', order_index: 4, status: 'published' },
    { title: 'Unimodal vs Multimodal AI', slug: 'unimodal-vs-multimodal-ai', parent_id: 3, layout_type: 'doc', content: '# Unimodal vs Multimodal AI', order_index: 5, status: 'published' },

    // 2. Introduction to Large Language Models (id=10)
    { title: 'Introduction to Large Language Models (LLMs)', slug: 'introduction-to-llms', parent_id: null, layout_type: 'doc', content: '# Introduction to Large Language Models (LLMs)\n\nUnderstanding LLMs, transformers, and GPT.', order_index: 2, status: 'published' },

    // 2.1 Introduction to LLM (id=11, parent=10)
    { title: 'Introduction to LLM', slug: 'intro-to-llm', parent_id: 10, layout_type: 'doc', content: '# Introduction to LLM\n\nFundamentals of Large Language Models.', order_index: 0, status: 'published' },
    { title: 'Intro to LLM', slug: 'intro-llm-basics', parent_id: 11, layout_type: 'doc', content: '# Intro to LLM', order_index: 0, status: 'published' },
    { title: 'Tokens, Context Size, Parameters, Temperature', slug: 'tokens-context-parameters', parent_id: 11, layout_type: 'doc', content: '# Tokens, Context Size, Parameters, Temperature', order_index: 1, status: 'published' },
    { title: 'General Architecture of LLMs', slug: 'llm-architecture', parent_id: 11, layout_type: 'doc', content: '# General Architecture of LLMs\n\nTransformers, self-attention mechanisms.', order_index: 2, status: 'published' },
    { title: 'Popular LLMs in the Market', slug: 'popular-llms', parent_id: 11, layout_type: 'doc', content: '# Popular LLMs in the Market\n\nLLAMA, GPT, Gemini, Mistral AI, and more.', order_index: 3, status: 'published' },
    { title: 'Open-source LLMs', slug: 'open-source-llms', parent_id: 11, layout_type: 'doc', content: '# Open-source LLMs', order_index: 4, status: 'published' },
    { title: 'Free Alternatives to OpenAI', slug: 'free-alternatives-openai', parent_id: 11, layout_type: 'doc', content: '# Free Alternatives to OpenAI', order_index: 5, status: 'published' },
    { title: 'Small Language Models (SLM) vs LLM', slug: 'slm-vs-llm', parent_id: 11, layout_type: 'doc', content: '# Small Language Models (SLM) vs Large Language Models (LLM)', order_index: 6, status: 'published' },

    // 2.2 Understanding Transformer (id=19, parent=10)
    { title: 'Understanding Transformer', slug: 'understanding-transformer', parent_id: 10, layout_type: 'doc', content: '# Understanding Transformer\n\nDeep dive into transformer architecture.', order_index: 1, status: 'published' },
    { title: 'Basics of Transformer', slug: 'basics-of-transformer', parent_id: 19, layout_type: 'doc', content: '# Basics of Transformer', order_index: 0, status: 'published' },
    { title: 'Various Attention Mechanisms', slug: 'attention-mechanisms', parent_id: 19, layout_type: 'doc', content: '# Various Attention Mechanisms', order_index: 1, status: 'published' },
    { title: 'Self-Attention', slug: 'self-attention', parent_id: 19, layout_type: 'doc', content: '# Self-Attention', order_index: 2, status: 'published' },
    { title: 'Transformer Architecture in Detail', slug: 'transformer-architecture-detail', parent_id: 19, layout_type: 'doc', content: '# Transformer Architecture in Detail', order_index: 3, status: 'published' },

    // 2.3 Understanding GPT (id=24, parent=10)
    { title: 'Understanding GPT', slug: 'understanding-gpt', parent_id: 10, layout_type: 'doc', content: '# Understanding GPT', order_index: 2, status: 'published' },
    { title: 'Basics of GPT Architecture', slug: 'basics-gpt-architecture', parent_id: 24, layout_type: 'doc', content: '# Basics of GPT Architecture', order_index: 0, status: 'published' },
    { title: 'Details on GPT, GPT-4, Mixture of Models', slug: 'gpt-gpt4-mixture-models', parent_id: 24, layout_type: 'doc', content: '# Details on GPT, GPT-4, Mixture of Models', order_index: 1, status: 'published' },

    // 3. Understanding Generative Models (id=27)
    { title: 'Understanding Generative Models', slug: 'understanding-generative-models', parent_id: null, layout_type: 'doc', content: '# Understanding Generative Models\n\nGANs, diffusion models, and deepfake technologies.', order_index: 3, status: 'published' },

    // 3.1 Understanding GAN (id=28, parent=27)
    { title: 'Understanding GAN', slug: 'understanding-gan', parent_id: 27, layout_type: 'doc', content: '# Understanding GAN\n\nGenerative Adversarial Networks.', order_index: 0, status: 'published' },
    { title: 'What are Generative Models?', slug: 'what-are-generative-models', parent_id: 28, layout_type: 'doc', content: '# What are Generative Models?', order_index: 0, status: 'published' },
    { title: 'Examples of Generative Models', slug: 'examples-generative-models', parent_id: 28, layout_type: 'doc', content: '# Examples of Generative Models', order_index: 1, status: 'published' },
    { title: 'GAN', slug: 'gan', parent_id: 28, layout_type: 'doc', content: '# GAN (Generative Adversarial Networks)', order_index: 2, status: 'published' },
    { title: 'Structure and Training of GAN', slug: 'structure-training-gan', parent_id: 28, layout_type: 'doc', content: '# Structure and Training of GAN', order_index: 3, status: 'published' },
    { title: 'Types of GAN', slug: 'types-of-gan', parent_id: 28, layout_type: 'doc', content: '# Types of GAN', order_index: 4, status: 'published' },

    // 3.2 Text-to-Image Models (id=34, parent=27)
    { title: 'Text-to-Image Models', slug: 'text-to-image-models', parent_id: 27, layout_type: 'doc', content: '# Text-to-Image Models', order_index: 1, status: 'published' },
    { title: 'Diffusion Models', slug: 'diffusion-models', parent_id: 34, layout_type: 'doc', content: '# Diffusion Models\n\nMidjourney, DALL-E.', order_index: 0, status: 'published' },
    { title: 'Types of Diffusion', slug: 'types-of-diffusion', parent_id: 34, layout_type: 'doc', content: '# Types of Diffusion\n\nStable Diffusion and others.', order_index: 1, status: 'published' },

    // 3.3 Deepfake Technologies (id=37, parent=27)
    { title: 'Deepfake Technologies – Models', slug: 'deepfake-technologies', parent_id: 27, layout_type: 'doc', content: '# Deepfake Technologies – Models', order_index: 2, status: 'published' },
    { title: 'What is Deepfake?', slug: 'what-is-deepfake', parent_id: 37, layout_type: 'doc', content: '# What is Deepfake?', order_index: 0, status: 'published' },
    { title: 'Models Used in Deepfake', slug: 'models-used-deepfake', parent_id: 37, layout_type: 'doc', content: '# Models Used in Deepfake', order_index: 1, status: 'published' },
    { title: 'Ethical Implications of Deepfake', slug: 'ethical-implications-deepfake', parent_id: 37, layout_type: 'doc', content: '# Ethical Implications of Deepfake', order_index: 2, status: 'published' },
    { title: 'Prevention to Avoid Deepfake Attacks', slug: 'prevention-deepfake-attacks', parent_id: 37, layout_type: 'doc', content: '# Prevention to Avoid Deepfake Attacks', order_index: 3, status: 'published' },

    // 4. Training Techniques for LLMs (id=42)
    { title: 'Training Techniques for LLMs', slug: 'training-techniques-llms', parent_id: null, layout_type: 'doc', content: '# Training Techniques for LLMs\n\nPre-training, learning paradigms, and fine-tuning.', order_index: 4, status: 'published' },

    // 4.1 LLM Pre-training Techniques (id=43, parent=42)
    { title: 'LLM Pre-training Techniques', slug: 'llm-pretraining-techniques', parent_id: 42, layout_type: 'doc', content: '# LLM Pre-training Techniques', order_index: 0, status: 'published' },
    { title: 'Data Requirements for LLM Pre-training', slug: 'data-requirements-pretraining', parent_id: 43, layout_type: 'doc', content: '# Data Requirements for LLM Pre-training', order_index: 0, status: 'published' },
    { title: 'Data Sources, Size, Cleaning Techniques', slug: 'data-sources-size-cleaning', parent_id: 43, layout_type: 'doc', content: '# Data Sources, Data Size, Data Cleaning Techniques', order_index: 1, status: 'published' },
    { title: 'Compute and Cost Requirements', slug: 'compute-cost-requirements', parent_id: 43, layout_type: 'doc', content: '# Compute and Cost Requirements for LLM Pre-training', order_index: 2, status: 'published' },
    { title: 'LLM Training Techniques', slug: 'llm-training-techniques', parent_id: 43, layout_type: 'doc', content: '# LLM Training Techniques\n\nSupervised, Unsupervised, Reinforcement Learning, RLHF.', order_index: 3, status: 'published' },
    { title: 'LLM Pre-training Tasks', slug: 'llm-pretraining-tasks', parent_id: 43, layout_type: 'doc', content: '# LLM Pre-training Tasks', order_index: 4, status: 'published' },

    // 4.2 LLM Learning Paradigms (id=49, parent=42)
    { title: 'LLM Learning Paradigms', slug: 'llm-learning-paradigms', parent_id: 42, layout_type: 'doc', content: '# LLM Learning Paradigms', order_index: 1, status: 'published' },
    { title: 'Transfer Learning', slug: 'transfer-learning', parent_id: 49, layout_type: 'doc', content: '# Transfer Learning', order_index: 0, status: 'published' },
    { title: 'Few-shot Learning', slug: 'few-shot-learning', parent_id: 49, layout_type: 'doc', content: '# Few-shot Learning', order_index: 1, status: 'published' },
    { title: 'Zero-shot Learning', slug: 'zero-shot-learning', parent_id: 49, layout_type: 'doc', content: '# Zero-shot Learning', order_index: 2, status: 'published' },
    { title: 'One-shot Learning', slug: 'one-shot-learning', parent_id: 49, layout_type: 'doc', content: '# One-shot Learning', order_index: 3, status: 'published' },

    // 4.3 LLM Fine-tuning Techniques (id=54, parent=42)
    { title: 'LLM Fine-tuning Techniques', slug: 'llm-finetuning-techniques', parent_id: 42, layout_type: 'doc', content: '# LLM Fine-tuning Techniques', order_index: 2, status: 'published' },
    { title: 'Understanding LLM Fine-tuning', slug: 'understanding-llm-finetuning', parent_id: 54, layout_type: 'doc', content: '# Understanding LLM Fine-tuning', order_index: 0, status: 'published' },
    { title: 'Fine-tuning vs Training from Scratch', slug: 'finetuning-vs-training-scratch', parent_id: 54, layout_type: 'doc', content: '# Fine-tuning vs Training from Scratch\n\nHow to decide.', order_index: 1, status: 'published' },
    { title: 'Data Requirements for Fine-tuning', slug: 'data-requirements-finetuning', parent_id: 54, layout_type: 'doc', content: '# Data Requirements for LLM Fine-tuning', order_index: 2, status: 'published' },
    { title: 'Compute Requirements for Fine-tuning', slug: 'compute-requirements-finetuning', parent_id: 54, layout_type: 'doc', content: '# Compute Requirements for LLM Fine-tuning', order_index: 3, status: 'published' },
    { title: 'Fine-tuning Techniques (PEFT, LoRA, Q-LoRA)', slug: 'finetuning-peft-lora-qlora', parent_id: 54, layout_type: 'doc', content: '# Fine-tuning Techniques\n\nPEFT, LoRA, Q-LoRA.', order_index: 4, status: 'published' },
    { title: 'Fine-tuning Tools Available', slug: 'finetuning-tools-available', parent_id: 54, layout_type: 'doc', content: '# Fine-tuning Tools Available in the Market', order_index: 5, status: 'published' },

    // 5. LLM Evaluation Techniques (id=61)
    { title: 'LLM Evaluation Techniques', slug: 'llm-evaluation-techniques', parent_id: null, layout_type: 'doc', content: '# LLM Evaluation Techniques\n\nMetrics, datasets, benchmarking, and tackling hallucinations.', order_index: 5, status: 'published' },

    // 5.1 LLM Evaluation (id=62, parent=61)
    { title: 'LLM Evaluation', slug: 'llm-evaluation', parent_id: 61, layout_type: 'doc', content: '# LLM Evaluation', order_index: 0, status: 'published' },
    { title: 'Why LLM Evaluation is Challenging', slug: 'why-llm-evaluation-challenging', parent_id: 62, layout_type: 'doc', content: '# Why LLM Evaluation is Challenging', order_index: 0, status: 'published' },
    { title: 'LLM Evaluation Metrics', slug: 'llm-evaluation-metrics', parent_id: 62, layout_type: 'doc', content: '# LLM Evaluation Metrics', order_index: 1, status: 'published' },
    { title: 'LLM Evaluation Datasets', slug: 'llm-evaluation-datasets', parent_id: 62, layout_type: 'doc', content: '# LLM Evaluation Datasets', order_index: 2, status: 'published' },
    { title: 'Current Benchmarking', slug: 'current-benchmarking', parent_id: 62, layout_type: 'doc', content: '# Current Benchmarking', order_index: 3, status: 'published' },
    { title: 'LLM Evaluation Examples', slug: 'llm-evaluation-examples', parent_id: 62, layout_type: 'doc', content: '# LLM Evaluation Examples', order_index: 4, status: 'published' },
    { title: 'Tackling Hallucinations', slug: 'tackling-hallucinations', parent_id: 62, layout_type: 'doc', content: '# Tackling Hallucinations', order_index: 5, status: 'published' },

    // 6. LLM Prompting (id=69)
    { title: 'LLM Prompting', slug: 'llm-prompting', parent_id: null, layout_type: 'doc', content: '# LLM Prompting\n\nTechniques for effective prompting.', order_index: 6, status: 'published' },

    // 6.1 All About Prompting for LLM (id=70, parent=69)
    { title: 'All About Prompting for LLM', slug: 'all-about-prompting', parent_id: 69, layout_type: 'doc', content: '# All About Prompting for LLM', order_index: 0, status: 'published' },
    { title: 'Basics of Prompting', slug: 'basics-of-prompting', parent_id: 70, layout_type: 'doc', content: '# Basics of Prompting\n\nWhy prompting is critical.', order_index: 0, status: 'published' },
    { title: 'Techniques for Effective Prompting', slug: 'techniques-effective-prompting', parent_id: 70, layout_type: 'doc', content: '# Techniques for Effective Prompting\n\nChain of Thought, etc.', order_index: 1, status: 'published' },
    { title: 'Prompting Templates', slug: 'prompting-templates', parent_id: 70, layout_type: 'doc', content: '# Prompting Templates', order_index: 2, status: 'published' },
    { title: 'Examples of Good Prompting', slug: 'examples-good-prompting', parent_id: 70, layout_type: 'doc', content: '# Examples of Good Prompting', order_index: 3, status: 'published' },
    { title: 'Understanding Hallucination', slug: 'understanding-hallucination', parent_id: 70, layout_type: 'doc', content: '# Understanding Hallucination', order_index: 4, status: 'published' },

    // 7. Applications of LLM (id=76)
    { title: 'Applications of LLM', slug: 'applications-of-llm', parent_id: null, layout_type: 'doc', content: '# Applications of LLM\n\nRAG, LLMIndex, Agents, LangChain, LangSmith.', order_index: 7, status: 'published' },

    // 7.1 LLM Retrieval Using RAG (id=77, parent=76)
    { title: 'LLM Retrieval Using RAG', slug: 'llm-retrieval-rag', parent_id: 76, layout_type: 'tutorial', content: '# LLM Retrieval Using RAG', order_index: 0, status: 'published' },
    { title: 'All About RAG and Pipeline', slug: 'all-about-rag-pipeline', parent_id: 77, layout_type: 'doc', content: '# All About RAG and Pipeline', order_index: 0, status: 'published' },
    { title: 'RAG Working Example', slug: 'rag-working-example', parent_id: 77, layout_type: 'tutorial', content: '# RAG Working Example', order_index: 1, status: 'published' },

    // 7.2 Retrieval Using LLMIndex (id=80, parent=76)
    { title: 'Retrieval Using LLMIndex', slug: 'retrieval-llmindex', parent_id: 76, layout_type: 'tutorial', content: '# Retrieval Using LLMIndex', order_index: 1, status: 'published' },
    { title: 'All About LLMIndex', slug: 'all-about-llmindex', parent_id: 80, layout_type: 'doc', content: '# All About LLMIndex', order_index: 0, status: 'published' },
    { title: 'LLMIndex Working Example', slug: 'llmindex-working-example', parent_id: 80, layout_type: 'tutorial', content: '# LLMIndex Working Example', order_index: 1, status: 'published' },

    // 7.3 Building LLM Agents (id=83, parent=76)
    { title: 'Building LLM Agents Using GenAI', slug: 'building-llm-agents', parent_id: 76, layout_type: 'tutorial', content: '# Building LLM Agents Using GenAI', order_index: 2, status: 'published' },
    { title: 'Agent Definition', slug: 'agent-definition', parent_id: 83, layout_type: 'doc', content: '# Agent Definition', order_index: 0, status: 'published' },

    // 7.4 Building Applications Using LangChain (id=85, parent=76)
    { title: 'Building Applications Using LangChain', slug: 'building-apps-langchain', parent_id: 76, layout_type: 'tutorial', content: '# Building Applications Using LangChain', order_index: 3, status: 'published' },
    { title: 'All About LangChain', slug: 'all-about-langchain', parent_id: 85, layout_type: 'doc', content: '# All About LangChain', order_index: 0, status: 'published' },
    { title: 'LangChain Working Example', slug: 'langchain-working-example', parent_id: 85, layout_type: 'tutorial', content: '# LangChain Working Example', order_index: 1, status: 'published' },

    // 7.5 Developing End-to-End Application Using LangSmith (id=88, parent=76)
    { title: 'Developing End-to-End Application Using LangSmith', slug: 'developing-app-langsmith', parent_id: 76, layout_type: 'tutorial', content: '# Developing End-to-End Application Using LangSmith', order_index: 4, status: 'published' },
    { title: 'All About LangSmith', slug: 'all-about-langsmith', parent_id: 88, layout_type: 'doc', content: '# All About LangSmith', order_index: 0, status: 'published' },
    { title: 'LangSmith Working Example', slug: 'langsmith-working-example', parent_id: 88, layout_type: 'tutorial', content: '# LangSmith Working Example', order_index: 1, status: 'published' },

    // 8. Practical Problems During Working on GenAI Projects (id=91)
    { title: 'Practical Problems During Working on GenAI Projects', slug: 'practical-problems-genai', parent_id: null, layout_type: 'doc', content: '# Practical Problems During Working on GenAI Projects', order_index: 8, status: 'published' },

    // 8.1 Validation Challenges (id=92, parent=91)
    { title: 'Validation Challenges Due to Lack of Probabilistic Outputs', slug: 'validation-challenges', parent_id: 91, layout_type: 'doc', content: '# Validation Challenges Due to Lack of Probabilistic Outputs from LLMs', order_index: 0, status: 'published' },
    { title: 'Lack of Probabilities', slug: 'lack-of-probabilities', parent_id: 92, layout_type: 'doc', content: '# Lack of Probabilities', order_index: 0, status: 'published' },
    { title: 'Interpretability and Explainability Challenges', slug: 'interpretability-explainability', parent_id: 92, layout_type: 'doc', content: '# Interpretability and Explainability Challenges', order_index: 1, status: 'published' },

    // 8.2 Hallucinations in Responses (id=95, parent=91)
    { title: 'Hallucinations in Responses', slug: 'hallucinations-in-responses', parent_id: 91, layout_type: 'doc', content: '# Hallucinations in Responses', order_index: 1, status: 'published' },
    { title: 'Plausible but Factually Incorrect Outputs', slug: 'plausible-incorrect-outputs', parent_id: 95, layout_type: 'doc', content: '# Plausible but Factually Incorrect or Fabricated Outputs', order_index: 0, status: 'published' },
    { title: 'Reliability Issues', slug: 'reliability-issues', parent_id: 95, layout_type: 'doc', content: '# Reliability Issues', order_index: 1, status: 'published' },
    { title: 'Example: Text-to-SQL Correctness Validation', slug: 'text-to-sql-validation', parent_id: 95, layout_type: 'doc', content: '# Example: Text-to-SQL Correctness Validation', order_index: 2, status: 'published' },

    // 9. AI Ethics and Governance (id=99)
    { title: 'AI Ethics and Governance', slug: 'ai-ethics-governance', parent_id: null, layout_type: 'doc', content: '# AI Ethics and Governance\n\nTransparency, safety, bias, and responsible AI.', order_index: 9, status: 'published' },

    // 9.1 AI Ethics and Governance (id=100, parent=99)
    { title: 'AI Ethics and Governance', slug: 'ethics-governance-overview', parent_id: 99, layout_type: 'doc', content: '# AI Ethics and Governance', order_index: 0, status: 'published' },
    { title: 'Transparency, Safety, Bias', slug: 'transparency-safety-bias', parent_id: 100, layout_type: 'doc', content: '# Transparency, Safety, Bias', order_index: 0, status: 'published' },
    { title: 'Explainable AI (XAI)', slug: 'explainable-ai-xai', parent_id: 100, layout_type: 'doc', content: '# Explainable AI (XAI)', order_index: 1, status: 'published' },
    { title: 'Human-in-the-Loop (HITL)', slug: 'human-in-the-loop', parent_id: 100, layout_type: 'doc', content: '# Human-in-the-Loop (HITL)', order_index: 2, status: 'published' },
    { title: 'Machine Learning Bias', slug: 'machine-learning-bias', parent_id: 100, layout_type: 'doc', content: '# Machine Learning Bias', order_index: 3, status: 'published' },
    { title: 'Ethical AI Maturity Model', slug: 'ethical-ai-maturity-model', parent_id: 100, layout_type: 'doc', content: '# Ethical AI Maturity Model', order_index: 4, status: 'published' },
    { title: 'Red-teaming and Toxicity', slug: 'red-teaming-toxicity', parent_id: 100, layout_type: 'doc', content: '# Red-teaming and Toxicity', order_index: 5, status: 'published' },
    { title: 'IP Rights in AI and Legal Challenges', slug: 'ip-rights-ai-legal', parent_id: 100, layout_type: 'doc', content: '# IP Rights in AI and Legal Challenges', order_index: 6, status: 'published' }
];

async function initializeDatabase ()
{
    try
    {
        console.log( 'Initializing database...' );

        await initDatabase();
        const db = getDatabase();

        // Create schema
        console.log( 'Creating schema...' );
        db.run( SCHEMA );

        // Check if data already exists
        const result = db.exec( 'SELECT COUNT(*) as count FROM pages' );
        const count = result[ 0 ]?.values[ 0 ]?.[ 0 ] || 0;

        if ( count === 0 )
        {
            console.log( 'Inserting seed data...' );

            // Insert seed data
            const stmt = db.prepare( `
        INSERT INTO pages (title, slug, parent_id, layout_type, content, order_index, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

            for ( const page of SEED_DATA )
            {
                stmt.run( [
                    page.title,
                    page.slug,
                    page.parent_id,
                    page.layout_type,
                    page.content,
                    page.order_index,
                    page.status
                ] );
            }

            stmt.free();
            console.log( `Inserted ${ SEED_DATA.length } pages` );
        } else
        {
            console.log( `Database already contains ${ count } pages. Skipping seed data.` );
        }

        // Save database to file
        saveDatabase();
        console.log( 'Database saved successfully!' );

        // Display structure
        console.log( '\nDatabase structure:' );
        const pages = db.exec( 'SELECT id, title, slug, parent_id, layout_type FROM pages ORDER BY order_index' );
        if ( pages[ 0 ] )
        {
            console.table( pages[ 0 ].values.map( row => ( {
                id: row[ 0 ],
                title: row[ 1 ],
                slug: row[ 2 ],
                parent_id: row[ 3 ] || 'NULL',
                layout: row[ 4 ]
            } ) ) );
        }

        closeDatabase();
        console.log( '\nDatabase initialization complete!' );

    } catch ( error )
    {
        console.error( 'Database initialization failed:', error );
        process.exit( 1 );
    }
}

// Run if called directly
if ( require.main === module )
{
    initializeDatabase();
}

module.exports = { initializeDatabase };
