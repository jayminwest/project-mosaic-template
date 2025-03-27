# Project Mosaic Documentation

This directory contains comprehensive documentation for Project Mosaic, a framework for rapidly developing profitable micro-SaaS products.

## Core Documentation

- [**PROJECT_MOSAIC_OVERVIEW.md**](PROJECT_MOSAIC_OVERVIEW.md) - Overview of the Project Mosaic initiative and goals
- [**architecture.md**](architecture.md) - System architecture and component relationships
- [**customization.md**](customization.md) - Guide for adapting the template to different product types
- [**glossary.md**](glossary.md) - Key terms and concepts used throughout the project

## Service Guides

- [**ai-service-guide.md**](ai-service-guide.md) - Guide for using the AI service abstraction layer
- [**email-configuration.md**](email-configuration.md) - Email setup and integration guide
- [**email-service-guide.md**](email-service-guide.md) - Detailed guide for using the email service
- [**plan-access-guide.md**](plan-access-guide.md) - Guide for controlling feature access based on subscription plans

## Integration Guides

- [**stripe-configuration.md**](stripe-configuration.md) - Stripe subscription setup guide
- [**stripe-portal-configuration.md**](stripe-portal-configuration.md) - Stripe Customer Portal configuration guide
- [**ab-testing-guide.md**](ab-testing-guide.md) - Guide for implementing A/B testing

## Implementation Resources

- [**implementation-plan.md**](implementation-plan.md) - Step-by-step implementation plan for Project Mosaic
- [**template-requirements.md**](template-requirements.md) - Requirements for the SaaS template

## Related Resources

For step-by-step tutorials on implementing specific features, see the [tutorial](../tutorial) directory:

- [CRUD Operations](../tutorial/1_CRUD.md)
- [Authentication](../tutorial/2_AUTH.md)
- [Storage](../tutorial/3_STORAGE.md)
- [Edge Functions](../tutorial/4_EDGE_FUNCTION.md)
- [Usage Limits](../tutorial/5_USAGE_LIMITS.md)
- [Stripe Setup](../tutorial/6A_STRIPE_SETUP.md)
- [Stripe Integration](../tutorial/6B_STRIPE_INTEGRATION.md)
- [Email Integration](../tutorial/7_EMAIL_INTEGRATION.md)
- [Configuration System](../tutorial/8_CONFIGURATION_SYSTEM.md)

## Using This Documentation

- **New to Project Mosaic?** Start with [PROJECT_MOSAIC_OVERVIEW.md](PROJECT_MOSAIC_OVERVIEW.md) and [architecture.md](architecture.md)
- **Building a product?** Follow the [customization.md](customization.md) guide
- **Need specific service details?** Check the relevant service guide
- **Looking for implementation steps?** See the [tutorial](../tutorial) directory

## Contributing to Documentation

When updating documentation:

1. Ensure all code examples are accurate and match the actual implementation
2. Keep service guides up-to-date with any changes to the service interfaces
3. Add cross-references between related documents
4. Include practical examples for common use cases
5. Update the implementation plan to reflect completed tasks
