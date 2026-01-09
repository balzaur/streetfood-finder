import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { Vendor } from "@ultimate-sf/shared";
import { colors, spacing } from "../theme";

interface VendorCardProps {
  vendor: Vendor;
}

export default function VendorCard({ vendor }: VendorCardProps) {
  return (
    <View style={styles.card}>
      {/* Image */}
      {vendor.photoUrl && (
        <Image
          source={{ uri: vendor.photoUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{vendor.name}</Text>
          {vendor.isOpen && (
            <View style={styles.openBadge}>
              <Text style={styles.openText}>OPEN</Text>
            </View>
          )}
        </View>

        {/* Cuisine & Area */}
        <View style={styles.metaRow}>
          <Text style={styles.cuisine}>{vendor.cuisine}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.area}>{vendor.area}</Text>
          {vendor.priceRange && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.price}>{vendor.priceRange}</Text>
            </>
          )}
        </View>

        {/* Rating */}
        {vendor.rating && (
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{vendor.rating.toFixed(1)}</Text>
          </View>
        )}

        {/* Description */}
        {vendor.description && (
          <Text style={styles.description} numberOfLines={2}>
            {vendor.description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.primary,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#E9ECEF",
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    flex: 1,
  },
  openBadge: {
    backgroundColor: colors.ui.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  openText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cuisine: {
    fontSize: 14,
    color: colors.brand.primary,
    fontWeight: "600",
  },
  separator: {
    fontSize: 14,
    color: colors.text.disabled,
    marginHorizontal: 6,
  },
  area: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  price: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  star: {
    fontSize: 16,
    marginRight: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
