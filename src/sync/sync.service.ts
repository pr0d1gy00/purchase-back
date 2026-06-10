import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PushSyncDto } from './dto/push-sync.dto';
import { Prisma } from 'generated/prisma/client'; // o de '@prisma/client' dependiendo de cómo lo tengas

@Injectable()
export class SyncService {
    constructor(private readonly prisma: PrismaService) { }

    async pullChanges(userId, lastPulledAt: number | string) {
        const lastSyncDate = new Date(lastPulledAt);
        const userOrGlobal = {
            OR: [{ userId }, { userId: null }]
        };
        const whereCondition = {
            updatedAt: {
                gt: lastSyncDate
            }
        }
        const stores = await this.prisma.store.findMany({ where: userOrGlobal });
        const categories = await this.prisma.category.findMany({ where: userOrGlobal });
        const products = await this.prisma.product.findMany({ where: { userId } });
        const purchases = await this.prisma.purchase.findMany({ where: { userId } });
        const purchasesItems = await this.prisma.purchaseItem.findMany({
            where: { purchase: { userId } }
        });
        const exchangeRates = await this.prisma.exchangeRate.findMany({ where: userOrGlobal });
        const purchaseGroups = await this.prisma.purchaseGroup.findMany({ where: userOrGlobal });

        return {
            lastPulledAt: new Date().getTime(),
            changes: {
                stores: this.categorizeChanges(stores, lastSyncDate),
                categories: this.categorizeChanges(categories, lastSyncDate),
                products: this.categorizeChanges(products, lastSyncDate),
                purchases: this.categorizeChanges(purchases, lastSyncDate),
                purchaseItems: this.categorizeChanges(purchasesItems, lastSyncDate),
                exchangeRates: this.categorizeChanges(exchangeRates, lastSyncDate),
                purchaseGroups: this.categorizeChanges(purchaseGroups, lastSyncDate),
            }
        };
    }

    private async resolveConflictLWW(
        tx: Prisma.TransactionClient,
        modelName: string,
        item: any,
        userId: string
    ): Promise<any> {
        const itemDate = new Date(item.updatedAt);
        const model = (tx as any)[modelName]; // Accedemos dinámicamente a tx.store, tx.product, etc.
        const dataToSave = modelName === 'purchaseItem' ? item : { ...item, userId };
        const existing = await model.findUnique({
            where: { id: item.id },
            select: { updatedAt: true }
        });
        if (!existing) {
            // No existe en la DB: Lo creamos
            await model.create({
                data: dataToSave
            });
        } else if (itemDate > existing.updatedAt) {
            // Existe, pero el del celular es más nuevo: Actualizamos
            await model.update({
                where: { id: item.id },
                data: dataToSave
            });
        }
        // Si el 'else' final no se cumple (el de la DB es más nuevo), 
        // lo ignoramos silenciosamente y protegemos nuestra data.
    }
    async pushChanges(userId, pushDto: PushSyncDto) {
        const { changes, } = pushDto

        await this.prisma.$transaction(async (tx) => {
            if (changes.stores) {
                const allStores = [...changes.stores.created, ...changes.stores.updated]
                for (const store of allStores) {
                    await this.resolveConflictLWW(tx, "store", store, userId);
                }
                for (const storeId of changes.stores.deleted) {
                    await tx.store.update({
                        where: { id: storeId },
                        data: {
                            deletedAt: new Date()
                        }
                    })
                }
            }
            if (changes.products) {
                const allProducts = [...changes.products.created, ...changes.products.updated]
                for (const product of allProducts) {
                    await this.resolveConflictLWW(tx, "product", product, userId);
                }
                for (const productId of changes.products.deleted) {
                    await tx.product.update({
                        where: { id: productId },
                        data: {
                            deletedAt: new Date()
                        }
                    })
                }
            }
            if (changes.purchases) {
                const allPurchases = [...changes.purchases.created, ...changes.purchases.updated]
                for (const purchase of allPurchases) {
                    await this.resolveConflictLWW(tx, "purchase", purchase, userId);
                }
                for (const purchaseId of changes.purchases.deleted) {
                    await tx.purchase.update({
                        where: { id: purchaseId },
                        data: {
                            deletedAt: new Date()
                        }
                    })
                }
            }
            if (changes.purchaseItems) {
                const allPurchaseItems = [...changes.purchaseItems.created, ...changes.purchaseItems.updated]
                for (const purchaseItem of allPurchaseItems) {
                    await this.resolveConflictLWW(tx, "purchaseItem", purchaseItem, userId);
                }
                for (const purchaseItemId of changes.purchaseItems.deleted) {
                    await tx.purchaseItem.update({
                        where: { id: purchaseItemId },
                        data: {
                            deletedAt: new Date()
                        }
                    })
                }
            }
            if (changes.categories) {
                const allCategories = [...changes.categories.created, ...changes.categories.updated]
                for (const category of allCategories) {
                    await this.resolveConflictLWW(tx, "category", category, userId);
                }
                for (const categoryId of changes.categories.deleted) {
                    await tx.category.update({
                        where: { id: categoryId },
                        data: {
                            deletedAt: new Date()
                        }
                    });
                }
            }
            if (changes.exchangeRates) {
                const allRates = [...changes.exchangeRates.created, ...changes.exchangeRates.updated]
                for (const rate of allRates) {
                    await this.resolveConflictLWW(tx, "exchangeRate", rate, userId);
                }
                for (const rateId of changes.exchangeRates.deleted) {
                    await tx.exchangeRate.update({
                        where: { id: rateId },
                        data: { deletedAt: new Date() }
                    });
                }
            }
            if (changes.purchaseGroups) {
                const allPurchaseGroups = [...changes.purchaseGroups.created, ...changes.purchaseGroups.updated]
                for (const purchaseGroup of allPurchaseGroups) {
                    await this.resolveConflictLWW(tx, "purchaseGroup", purchaseGroup, userId);
                }
                for (const purchaseGroupId of changes.purchaseGroups.deleted) {
                    await tx.purchaseGroup.update({
                        where: { id: purchaseGroupId },
                        data: { deletedAt: new Date() }
                    });
                }
            }

        })
        return { success: true }
    }
    private categorizeChanges(records: any[], lastSyncDate: Date) {
        const created: any[] = [];
        const updated: any[] = [];
        const deleted: any[] = [];

        for (const record of records) {
            if (record.deletedAt) {
                deleted.push(record.id)
            } else if (record.createdAt > lastSyncDate) {
                created.push(record)
            } else {
                updated.push(record)
            }
        }

        return { created, updated, deleted }
    }
}
